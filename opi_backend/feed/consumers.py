import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class ChatGrupoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.grupo_id = self.scope['url_route']['kwargs']['grupo_id']
        self.room_group = f'chat_grupo_{self.grupo_id}'
        self.user = self.scope['user']

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        # Verifica se o usuário pode acessar este grupo
        pode = await self.verificar_acesso()
        if not pode:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        conteudo = data.get('conteudo', '').strip()
        if not conteudo:
            return

        mensagem = await self.salvar_mensagem(conteudo)
        if not mensagem:
            return

        await self.channel_layer.group_send(
            self.room_group,
            {
                'type': 'chat_message',
                'id': mensagem['id'],
                'autor_id': self.user.id,
                'autor_nome': self.user.nome,
                'conteudo': conteudo,
                'tipo': 'TEXTO',
                'arquivo_url': None,
                'nome_arquivo': None,
                'enviada_em': mensagem['enviada_em'],
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'autor': {'id': event['autor_id'], 'nome': event['autor_nome']},
            'conteudo': event['conteudo'],
            'tipo': event['tipo'],
            'arquivo_url': event['arquivo_url'],
            'nome_arquivo': event['nome_arquivo'],
            'enviada_em': event['enviada_em'],
        }))

    @database_sync_to_async
    def verificar_acesso(self):
        from projetos.models import Grupo
        try:
            grupo = Grupo.objects.get(id=self.grupo_id)
            return (
                grupo.membros.filter(id=self.user.id).exists()
                or self.user.is_coordenador
            )
        except Grupo.DoesNotExist:
            return False

    @database_sync_to_async
    def salvar_mensagem(self, conteudo):
        from .models import CanalGrupo, MensagemGrupo
        from projetos.models import Grupo
        try:
            grupo = Grupo.objects.get(id=self.grupo_id)
            canal, _ = CanalGrupo.objects.get_or_create(grupo=grupo)
            msg = MensagemGrupo.objects.create(
                canal=canal, autor=self.user, conteudo=conteudo, tipo='TEXTO'
            )
            return {'id': msg.id, 'enviada_em': msg.enviada_em.isoformat()}
        except Exception:
            return None


class VideoCallConsumer(AsyncWebsocketConsumer):
    """Signaling server para WebRTC - retransmite offer/answer/ICE entre peers."""

    # Rastreia participantes ativos: {room_group: {channel_name: {user_id, user_nome}}}
    active_rooms: dict = {}

    async def connect(self):
        self.grupo_id = self.scope['url_route']['kwargs']['grupo_id']
        self.room_group = f'video_grupo_{self.grupo_id}'
        self.user = self.scope['user']

        # modo=presenca: so observa a sala, nao entra como participante
        query = dict(q.split('=') for q in self.scope.get('query_string', b'').decode().split('&') if '=' in q)
        self.modo_presenca = query.get('modo') == 'presenca'

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        pode = await self._verificar_acesso()
        if not pode:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

        if self.modo_presenca:
            # Apenas envia quem esta na sala, sem registrar como participante
            outros = [
                {'user_id': v['user_id'], 'user_nome': v['user_nome'] or f'Usuário {v["user_id"]}', 'channel': k}
                for k, v in self.active_rooms.get(self.room_group, {}).items()
                if v['user_id'] != self.user.id
            ]
            await self.send(text_data=__import__('json').dumps({
                'type': 'room-status',
                'participants': outros,
                'my_channel': self.channel_name,
            }))
            return

        # Registra na sala (modo chamada)
        if self.room_group not in self.active_rooms:
            self.active_rooms[self.room_group] = {}
        nome = self.user.nome or f'Usuário {self.user.id}'
        self.active_rooms[self.room_group][self.channel_name] = {
            'user_id': self.user.id,
            'user_nome': nome,
        }

        # Envia ao novo joiner a lista de quem já está na sala
        # Exclui: próprio canal E canais do mesmo usuário (evita self-duplicata)
        outros = [
            {'user_id': v['user_id'], 'user_nome': v['user_nome'] or f'Usuário {v["user_id"]}', 'channel': k}
            for k, v in self.active_rooms[self.room_group].items()
            if k != self.channel_name and v['user_id'] != self.user.id
        ]
        await self.send(text_data=json.dumps({
            'type': 'room-status',
            'participants': outros,
            'my_channel': self.channel_name,
        }))

        # Avisa os outros que este usuário entrou
        await self.channel_layer.group_send(self.room_group, {
            'type': 'peer_joined',
            'user_id': self.user.id,
            'user_nome': nome,
            'from_channel': self.channel_name,
        })

    async def disconnect(self, close_code):
        if not self.modo_presenca:
            # Remove da sala e avisa os outros (apenas participantes reais)
            room = self.active_rooms.get(self.room_group, {})
            room.pop(self.channel_name, None)
            if not room:
                self.active_rooms.pop(self.room_group, None)

            await self.channel_layer.group_send(self.room_group, {
                'type': 'peer_left',
                'user_id': self.user.id,
                'user_nome': self.user.nome,
            })
        await self.channel_layer.group_discard(self.room_group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type')          # offer | answer | ice-candidate
        target_channel = data.get('target')  # channel_name do destinatário

        if msg_type in ('offer', 'answer', 'ice-candidate') and target_channel:
            await self.channel_layer.send(target_channel, {
                'type': 'signaling',
                'signal_type': msg_type,
                'payload': data.get('payload'),
                'from_user_id': self.user.id,
                'from_user_nome': self.user.nome or f'Usuário {self.user.id}',
                'from_channel': self.channel_name,
            })

    # ---- handlers de eventos do channel layer ----

    async def peer_joined(self, event):
        if event['from_channel'] == self.channel_name:
            return  # não notifica a si mesmo
        await self.send(text_data=json.dumps({
            'type': 'peer-joined',
            'user_id': event['user_id'],
            'user_nome': event['user_nome'],
            'channel': event['from_channel'],
        }))

    async def peer_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'peer-left',
            'user_id': event['user_id'],
        }))

    async def signaling(self, event):
        await self.send(text_data=json.dumps({
            'type': event['signal_type'],
            'payload': event['payload'],
            'from_user_id': event['from_user_id'],
            'from_user_nome': event['from_user_nome'],
            'from_channel': event['from_channel'],
        }))

    @database_sync_to_async
    def _verificar_acesso(self):
        from projetos.models import Grupo
        try:
            grupo = Grupo.objects.get(id=self.grupo_id)
            return (
                grupo.membros.filter(id=self.user.id).exists()
                or self.user.is_coordenador
            )
        except Grupo.DoesNotExist:
            return False
