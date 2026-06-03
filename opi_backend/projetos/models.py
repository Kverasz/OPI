from django.db import models
from django.core.exceptions import ValidationError
from usuarios.models import Usuario, Turma


class Grupo(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    turma = models.ForeignKey(Turma, on_delete=models.RESTRICT, related_name='grupos')
    criado_por = models.ForeignKey(
        Usuario, on_delete=models.RESTRICT, related_name='grupos_criados'
    )
    membros = models.ManyToManyField(
        Usuario, related_name='grupos', blank=True
    )
    cor = models.CharField(max_length=7, default='#003D7A')
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'grupos'
        ordering = ['-criado_em']

    def __str__(self):
        return f'{self.nome} — {self.turma}'

class Projeto(models.Model):
    STATUS = [
        ('PENDENTE', 'Pendente'),
        ('EM_AVALIACAO', 'Em Avaliação'),
        ('AVALIADO', 'Avaliado'),
        ('ARQUIVADO', 'Arquivado'),
    ]

    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    resumo_300 = models.CharField(max_length=300, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='PENDENTE')
    area_tematica = models.CharField(max_length=100)
    link_demo = models.TextField(blank=True, null=True)
    link_repositorio = models.TextField(blank=True, null=True)
    em_avaliacao_por = models.ForeignKey(
        Usuario, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='projetos_em_avaliacao'
    )
    avaliacao_iniciada_em = models.DateTimeField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    publicado_no_feed = models.BooleanField(default=False)
    turma = models.ForeignKey(Turma, on_delete=models.RESTRICT, related_name='projetos')
    criado_por = models.ForeignKey(
        Usuario, on_delete=models.RESTRICT, related_name='projetos_criados'
    )
    membros = models.ManyToManyField(
        Usuario, through='ProjetoMembro', related_name='projetos_participando', blank=True
    )
    grupo = models.ForeignKey(
        'Grupo', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='projetos'
    )

    class Meta:
        db_table = 'projetos'
        ordering = ['-criado_em']

    def __str__(self):
        return f'{self.titulo} [{self.status}]'

    def pode_editar(self):
        return self.status == 'PENDENTE'

    def delete(self, *args, **kwargs):
        if self.status != 'PENDENTE':
            raise ValidationError(
                f'Projeto "{self.titulo}" não pode ser deletado pois está "{self.status}". '
                'Apenas projetos PENDENTES podem ser excluídos.'
            )
        super().delete(*args, **kwargs)


class ProjetoMembro(models.Model):
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    papel_no_grupo = models.CharField(max_length=60, blank=True)
    adicionado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'projeto_membros'
        unique_together = ('projeto', 'usuario')


class ProjetoTecnologia(models.Model):
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='tecnologias')
    tecnologia = models.CharField(max_length=60)

    class Meta:
        db_table = 'projeto_tecnologias'


class ProjetoArquivo(models.Model):
    TIPOS = [('PDF', 'PDF'), ('ZIP', 'ZIP'), ('LINK_EXTERNO', 'Link Externo'), ('IMAGEM', 'Imagem')]
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='arquivos')
    nome_arquivo = models.CharField(max_length=255)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    url = models.TextField()
    versao = models.SmallIntegerField(default=1)
    enviado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    enviado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'projeto_arquivos'


class HistoricoVersao(models.Model):
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='historico')
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    versao = models.SmallIntegerField()
    acao = models.CharField(max_length=60)
    descricao_mudanca = models.TextField(blank=True)
    status_anterior = models.CharField(max_length=30, blank=True)
    registrado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'historico_versoes'
        ordering = ['-registrado_em']
