from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Turma, UsuarioTurma

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ['nome', 'email', 'perfil', 'ativo', 'criado_em']
    list_filter = ['perfil', 'ativo']
    search_fields = ['nome', 'email']
    ordering = ['nome']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Dados pessoais', {'fields': ('nome', 'perfil', 'foto_url', 'consentimento_lgpd')}),
        ('Status', {'fields': ('ativo', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {'fields': ('email', 'nome', 'perfil', 'password1', 'password2')}),
    )

@admin.register(Turma)
class TurmaAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nome', 'turno', 'ano', 'semestre', 'ativa']

@admin.register(UsuarioTurma)
class UsuarioTurmaAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'turma', 'papel']
