from rest_framework import serializers
from .models import Curtida, Notificacao, CanalChat, Mensagem, CanalParticipante
from usuarios.serializers import UsuarioSerializer
from projetos.serializers import ProjetoSerializer


class CurtidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curtida
        fields = ['usuario', 'projeto', 'curtido_em']
        read_only_fields = ['usuario', 'curtido_em']


class NotificacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacao
        fields = '__all__'
        read_only_fields = ['usuario', 'criada_em']


class MensagemSerializer(serializers.ModelSerializer):
    autor = UsuarioSerializer(read_only=True)

    class Meta:
        model = Mensagem
        fields = ['id', 'canal', 'autor', 'conteudo', 'tipo', 'enviada_em']
        read_only_fields = ['id', 'autor', 'enviada_em', 'canal']


class CanalChatSerializer(serializers.ModelSerializer):
    participantes = UsuarioSerializer(many=True, read_only=True)
    mensagens = MensagemSerializer(many=True, read_only=True)

    class Meta:
        model = CanalChat
        fields = ['id', 'projeto', 'nome', 'criado_em', 'participantes', 'mensagens']
