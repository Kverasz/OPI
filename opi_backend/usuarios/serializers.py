from rest_framework import serializers
from .models import Usuario, Turma, UsuarioTurma
from django.utils import timezone


class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = '__all__'


class UsuarioSerializer(serializers.ModelSerializer):
    turmas = TurmaSerializer(many=True, read_only=True)
    turma_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Usuario
        fields = [
            'id', 'nome', 'email', 'perfil', 'foto_url', 'curso',
            'consentimento_lgpd', 'ativo', 'ultimo_acesso',
            'criado_em', 'turmas', 'turma_ids',
            'sobre_mim', 'hard_skills', 'soft_skills',
        ]
        read_only_fields = ['id', 'criado_em', 'ultimo_acesso']

    def _curso_da_turma(self, nome):
        n = nome.upper()
        if n.startswith('ADS'): return 'ADS'
        if n.startswith('DESIGN'): return 'DESIGN'
        if n.startswith('GASTRO'): return 'GASTRO'
        return nome

    def update(self, instance, validated_data):
        turma_ids = validated_data.pop('turma_ids', None)
        instance = super().update(instance, validated_data)
        if turma_ids is not None:
            # Aluno: valida uma turma por curso
            if instance.perfil == 'ALUNO':
                turmas = [t for t in (Turma.objects.filter(id__in=turma_ids)) if t]
                cursos_vistos = set()
                for t in turmas:
                    curso = self._curso_da_turma(t.nome)
                    if curso in cursos_vistos:
                        raise serializers.ValidationError(
                            f'Aluno so pode ter uma turma por curso. Curso duplicado: {curso}'
                        )
                    cursos_vistos.add(curso)

            UsuarioTurma.objects.filter(usuario=instance).delete()
            papel = 'PROFESSOR' if instance.perfil == 'PROFESSOR' else 'ALUNO'
            for tid in turma_ids:
                turma = Turma.objects.filter(id=tid).first()
                if turma:
                    UsuarioTurma.objects.get_or_create(
                        usuario=instance, turma=turma,
                        defaults={'papel': papel}
                    )
        return instance


class UsuarioCriarSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, min_length=6)
    turma_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Usuario
        fields = ['nome', 'email', 'perfil', 'senha', 'foto_url', 'curso', 'consentimento_lgpd', 'turma_ids']

    def create(self, validated_data):
        turma_ids = validated_data.pop('turma_ids', [])
        senha = validated_data.pop('senha')
        request = self.context.get('request')
        usuario = Usuario.objects.create_user(
            senha=senha,
            criado_por=request.user if request else None,
            **validated_data
        )
        papel = 'PROFESSOR' if usuario.perfil == 'PROFESSOR' else 'ALUNO'
        for tid in turma_ids:
            turma = Turma.objects.filter(id=tid).first()
            if turma:
                UsuarioTurma.objects.get_or_create(
                    usuario=usuario, turma=turma,
                    defaults={'papel': papel}
                )
        return usuario


class AlterarSenhaSerializer(serializers.Serializer):
    nova_senha = serializers.CharField(min_length=6, write_only=True)
    confirmar_senha = serializers.CharField(min_length=6, write_only=True)

    def validate(self, data):
        if data['nova_senha'] != data['confirmar_senha']:
            raise serializers.ValidationError('As senhas não conferem.')
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(username=data['email'], password=data['senha'])
        if not user:
            raise serializers.ValidationError('E-mail ou senha inválidos.')
        if not user.ativo:
            raise serializers.ValidationError('Conta desativada. Fale com o coordenador.')
        user.ultimo_acesso = timezone.now()
        user.save(update_fields=['ultimo_acesso'])
        data['user'] = user
        return data


class UsuarioTurmaSerializer(serializers.ModelSerializer):
    turma = TurmaSerializer(read_only=True)
    turma_id = serializers.PrimaryKeyRelatedField(
        queryset=Turma.objects.all(), source='turma', write_only=True
    )

    class Meta:
        model = UsuarioTurma
        fields = ['usuario', 'turma', 'turma_id', 'papel', 'vinculado_em']
        read_only_fields = ['vinculado_em']
