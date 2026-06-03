from django.contrib import admin
from .models import CriterioRubrica, Avaliacao, AvaliacaoCriterio

@admin.register(CriterioRubrica)
class CriterioAdmin(admin.ModelAdmin):
    list_display = ['nome', 'ordem', 'ativo']

class CriterioInline(admin.TabularInline):
    model = AvaliacaoCriterio
    extra = 0

@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display = ['projeto', 'professor', 'conceito', 'avaliado_em']
    inlines = [CriterioInline]
