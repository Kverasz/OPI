from django.db import models
from usuarios.models import Usuario
from projetos.models import Projeto


class Curtida(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='curtidas')
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='curtidas')
    curtido_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'curtidas'
        unique_together = ('usuario', 'projeto')


class Notificacao(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificacoes')
    tipo = models.CharField(max_length=50)
    mensagem = models.TextField()
    referencia_id = models.IntegerField(null=True, blank=True)
    lida = models.BooleanField(default=False)
    criada_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notificacoes'
        ordering = ['-criada_em']


class CanalChat(models.Model):
    projeto = models.OneToOneField(Projeto, on_delete=models.CASCADE, related_name='canal')
    nome = models.CharField(max_length=100)
    criado_em = models.DateTimeField(auto_now_add=True)
    participantes = models.ManyToManyField(
        Usuario, through='CanalParticipante', related_name='canais_chat', blank=True
    )

    class Meta:
        db_table = 'canais_chat'

    def __str__(self):
        return self.nome


class Mensagem(models.Model):
    TIPOS = [('TEXTO', 'Texto'), ('ARQUIVO', 'Arquivo'), ('SISTEMA', 'Sistema')]
    canal = models.ForeignKey(CanalChat, on_delete=models.CASCADE, related_name='mensagens')
    autor = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    conteudo = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPOS, default='TEXTO')
    enviada_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mensagens'
        ordering = ['enviada_em']


class CanalParticipante(models.Model):
    canal = models.ForeignKey(CanalChat, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    pode_escrever = models.BooleanField(default=True)
    adicionado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'canal_participantes'
        unique_together = ('canal', 'usuario')

class CanalGrupo(models.Model):
    grupo = models.OneToOneField(
        'projetos.Grupo', on_delete=models.CASCADE, related_name='canal'
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'canais_grupo'

class MensagemGrupo(models.Model):
    TIPOS = [('TEXTO', 'Texto'), ('ARQUIVO', 'Arquivo')]
    canal = models.ForeignKey(CanalGrupo, on_delete=models.CASCADE, related_name='mensagens')
    autor = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    conteudo = models.TextField(blank=True)
    tipo = models.CharField(max_length=10, choices=TIPOS, default='TEXTO')
    arquivo = models.FileField(upload_to='chat_arquivos/', null=True, blank=True)
    nome_arquivo = models.CharField(max_length=255, blank=True)
    enviada_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mensagens_grupo'
        ordering = ['enviada_em']
