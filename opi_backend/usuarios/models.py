from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UsuarioManager(BaseUserManager):
    def create_user(self, email, nome, perfil, senha=None, **extra_fields):
        if not email:
            raise ValueError('E-mail obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, nome=nome, perfil=perfil, **extra_fields)
        user.set_password(senha)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nome, senha=None, **extra_fields):
        extra_fields.setdefault('perfil', 'COORDENADOR')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, nome, senha=senha, **extra_fields)


class Turma(models.Model):
    TURNOS = [('MANHA', 'Manhã'), ('TARDE', 'Tarde'), ('NOITE', 'Noite')]
    codigo = models.CharField(max_length=20, unique=True)
    nome = models.CharField(max_length=100)
    turno = models.CharField(max_length=10, choices=TURNOS)
    ano = models.SmallIntegerField()
    semestre = models.SmallIntegerField()
    ativa = models.BooleanField(default=True)

    class Meta:
        db_table = 'turmas'
        ordering = ['-ano', '-semestre']

    def __str__(self):
        return f'{self.codigo} - {self.nome}'


class Usuario(AbstractBaseUser, PermissionsMixin):
    PERFIS = [
        ('ALUNO', 'Aluno'),
        ('PROFESSOR', 'Professor'),
        ('COORDENADOR', 'Coordenador'),
        ('EMPRESA', 'Empresa Parceira'),
    ]

    nome = models.CharField(max_length=120)
    email = models.EmailField(max_length=180, unique=True)
    perfil = models.CharField(max_length=20, choices=PERFIS)
    foto_url = models.TextField(blank=True, null=True)
    curso = models.CharField(max_length=100, blank=True, null=True)
    sobre_mim = models.TextField(blank=True, null=True)
    hard_skills = models.JSONField(default=list, blank=True)
    soft_skills = models.JSONField(default=list, blank=True)
    consentimento_lgpd = models.BooleanField(default=False)
    ativo = models.BooleanField(default=True)
    ultimo_acesso = models.DateTimeField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    criado_por = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='usuarios_criados'
    )
    turmas = models.ManyToManyField(
        Turma, through='UsuarioTurma', related_name='membros', blank=True
    )
    # campos Django obrigatórios
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    objects = UsuarioManager()

    class Meta:
        db_table = 'usuarios'

    def __str__(self):
        return f'{self.nome} ({self.perfil})'

    @property
    def is_coordenador(self):
        return self.perfil == 'COORDENADOR'

    @property
    def is_professor(self):
        return self.perfil == 'PROFESSOR'

    @property
    def is_aluno(self):
        return self.perfil == 'ALUNO'

    @property
    def is_empresa(self):
        return self.perfil == 'EMPRESA'


class UsuarioTurma(models.Model):
    PAPEIS = [('ALUNO', 'Aluno'), ('PROFESSOR', 'Professor')]
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE)
    papel = models.CharField(max_length=20, choices=PAPEIS)
    vinculado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'usuario_turma'
        unique_together = ('usuario', 'turma')
