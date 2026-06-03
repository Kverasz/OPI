from django.contrib import admin
from .models import Projeto, ProjetoMembro, ProjetoTecnologia, ProjetoArquivo, HistoricoVersao

class MembroInline(admin.TabularInline):
    model = ProjetoMembro
    extra = 0

class TecnologiaInline(admin.TabularInline):
    model = ProjetoTecnologia
    extra = 0

@admin.register(Projeto)
class ProjetoAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'status', 'area_tematica', 'turma', 'criado_em']
    list_filter = ['status', 'area_tematica']
    search_fields = ['titulo']
    inlines = [MembroInline, TecnologiaInline]
