from rest_framework.permissions import BasePermission


class IsCoordenador(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_coordenador


class IsProfessor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_professor


class IsAluno(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_aluno


class IsEmpresa(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_empresa


class IsCoordenadorOrProfessor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_coordenador or request.user.is_professor
        )


class IsNotEmpresa(BasePermission):
    """Qualquer usuário autenticado exceto Empresa"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and not request.user.is_empresa
