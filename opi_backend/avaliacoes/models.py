from django.db import models
from usuarios.models import Usuario
from projetos.models import Projeto


class CriterioRubrica(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)
    ordem = models.SmallIntegerField()
    ativo = models.BooleanField(default=True)

    class Meta:
        db_table = 'criterios_rubrica'
        ordering = ['ordem']

    def __str__(self):
        return self.nome


class Avaliacao(models.Model):
    CONCEITOS = [
        ('INSUFICIENTE', 'Insuficiente'),
        ('AINDA_NAO_SUFICIENTE', 'Ainda não suficiente'),
        ('BOM', 'Bom'),
        ('OTIMO', 'Ótimo'),
        ('EXCELENTE', 'Excelente'),
    ]
    projeto = models.OneToOneField(Projeto, on_delete=models.CASCADE, related_name='avaliacao')
    professor = models.ForeignKey(
        Usuario, on_delete=models.RESTRICT, related_name='avaliacoes_feitas'
    )
    conceito = models.CharField(max_length=30, choices=CONCEITOS)
    feedback_geral = models.TextField(blank=True)
    rubrica_assinatura = models.CharField(max_length=200, blank=True)
    avaliado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'avaliacoes'

    def __str__(self):
        return f'Avaliação - {self.projeto.titulo} - {self.conceito}'


class AvaliacaoCriterio(models.Model):
    CONCEITOS = [
        ('INSUFICIENTE', 'Insuficiente'),
        ('AINDA_NAO_SUFICIENTE', 'Ainda não suficiente'),
        ('BOM', 'Bom'),
        ('OTIMO', 'Ótimo'),
        ('EXCELENTE', 'Excelente'),
    ]
    avaliacao = models.ForeignKey(Avaliacao, on_delete=models.CASCADE, related_name='criterios')
    criterio = models.ForeignKey(CriterioRubrica, on_delete=models.RESTRICT)
    conceito = models.CharField(max_length=30, choices=CONCEITOS)
    comentario = models.TextField(blank=True)

    class Meta:
        db_table = 'avaliacao_criterios'
        unique_together = ('avaliacao', 'criterio')
