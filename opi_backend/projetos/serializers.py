from rest_framework import serializers
from .models import Projeto, ProjetoMembro, ProjetoTecnologia, ProjetoArquivo, HistoricoVersao
from usuarios.serializers import UsuarioSerializer, TurmaSerializer
from .models import Projeto, ProjetoMembro, ProjetoTecnologia, ProjetoArquivo, HistoricoVersao, Grupo


class GrupoSerializer(serializers.ModelSerializer):
    membros = UsuarioSerializer(many=True, read_only=True)
    membros_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    turma = TurmaSerializer(read_only=True)
    turma_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('usuarios.models', fromlist=['Turma']).Turma.objects.all(),
        source='turma', write_only=True
    )

    class Meta:
        model = Grupo
        fields = [
            'id', 'nome', 'descricao', 'turma', 'turma_id',
            'membros', 'membros_ids', 'cor', 'criado_em'
        ]
        read_only_fields = ['id', 'criado_em']

    def create(self, validated_data):
        membros_ids = validated_data.pop('membros_ids', [])
        request = self.context['request']
        grupo = Grupo.objects.create(criado_por=request.user, **validated_data)
        from usuarios.models import Usuario
        for uid in membros_ids:
            try:
                u = Usuario.objects.get(id=uid)
                grupo.membros.add(u)
            except Usuario.DoesNotExist:
                pass
        return grupo

    def update(self, instance, validated_data):
        membros_ids = validated_data.pop('membros_ids', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if membros_ids is not None:
            instance.membros.set(membros_ids)
        return instance

class ProjetoTecnologiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjetoTecnologia
        fields = ['id', 'tecnologia']


class ProjetoArquivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjetoArquivo
        fields = ['id', 'nome_arquivo', 'tipo', 'url', 'versao', 'enviado_em']


class ProjetoMembroSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        source='usuario', write_only=True,
        queryset=__import__('usuarios.models', fromlist=['Usuario']).Usuario.objects.all()
    )

    class Meta:
        model = ProjetoMembro
        fields = ['usuario', 'usuario_id', 'papel_no_grupo', 'adicionado_em']


class HistoricoVersaoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = HistoricoVersao
        fields = '__all__'


class ProjetoSerializer(serializers.ModelSerializer):
    tecnologias = ProjetoTecnologiaSerializer(many=True, read_only=True)
    arquivos = ProjetoArquivoSerializer(many=True, read_only=True)
    membros_detalhe = ProjetoMembroSerializer(
        source='projetomembro_set', many=True, read_only=True
    )
    criado_por = UsuarioSerializer(read_only=True)
    turma = TurmaSerializer(read_only=True)
    total_curtidas = serializers.SerializerMethodField()
    usuario_curtiu = serializers.SerializerMethodField()
    conceito = serializers.SerializerMethodField()
    feedback_geral = serializers.SerializerMethodField()
    avaliador_nome = serializers.SerializerMethodField()
    avaliado_em = serializers.SerializerMethodField()
    rubrica_assinatura = serializers.SerializerMethodField()
    rubricas_avaliacao = serializers.SerializerMethodField()

    class Meta:
        model = Projeto
        fields = [
            'id', 'titulo', 'descricao', 'resumo_300', 'status',
            'area_tematica', 'link_demo', 'link_repositorio',
            'criado_em', 'atualizado_em', 'turma', 'criado_por',
            'tecnologias', 'arquivos', 'membros_detalhe',
            'total_curtidas', 'usuario_curtiu', 'conceito', 'feedback_geral',
            'avaliador_nome', 'avaliado_em', 'rubrica_assinatura', 'rubricas_avaliacao',
            'publicado_no_feed', 'grupo_id'
        ]

    def get_total_curtidas(self, obj):
        return obj.curtidas.count()

    def get_usuario_curtiu(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.curtidas.filter(usuario=request.user).exists()
        return False

    def get_conceito(self, obj):
        if hasattr(obj, 'avaliacao'):
            return obj.avaliacao.conceito
        return None

    def get_feedback_geral(self, obj):
        if hasattr(obj, 'avaliacao'):
            return obj.avaliacao.feedback_geral
        return None

    def get_avaliador_nome(self, obj):
        if hasattr(obj, 'avaliacao') and obj.avaliacao.professor:
            return obj.avaliacao.professor.nome
        return None

    def get_avaliado_em(self, obj):
        if hasattr(obj, 'avaliacao'):
            return obj.avaliacao.avaliado_em.isoformat()
        return None

    def get_rubrica_assinatura(self, obj):
        if hasattr(obj, 'avaliacao'):
            return obj.avaliacao.rubrica_assinatura
        return None

    def get_rubricas_avaliacao(self, obj):
        if not hasattr(obj, 'avaliacao'):
            return []
        return [
            {
                'criterio_id': str(c.criterio_id),
                'criterio_nome': c.criterio.nome,
                'criterio_descricao': c.criterio.descricao,
                'conceito': c.conceito,
                'comentario': c.comentario,
            }
            for c in obj.avaliacao.criterios.select_related('criterio').all()
        ]


class ProjetoCriarSerializer(serializers.ModelSerializer):
    tecnologias = serializers.ListField(
        child=serializers.CharField(max_length=60), write_only=True, required=False
    )
    membros_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    grupo_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    criado_por_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    conceito = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    feedback_geral = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Projeto
        fields = [
            'titulo', 'descricao', 'resumo_300', 'area_tematica',
            'link_demo', 'link_repositorio', 'turma', 'status',
            'tecnologias', 'membros_ids', 'grupo_id', 'criado_por_id',
            'conceito', 'feedback_geral',
        ]

    def create(self, validated_data):
        tecnologias = validated_data.pop('tecnologias', [])
        membros_ids = validated_data.pop('membros_ids', [])
        criado_por_id = validated_data.pop('criado_por_id', None)
        request = self.context['request']

        # Coordenador pode criar em nome de um aluno
        from usuarios.models import Usuario
        if request.user.is_coordenador and criado_por_id:
            try:
                criado_por = Usuario.objects.get(id=criado_por_id)
            except Usuario.DoesNotExist:
                criado_por = request.user
        else:
            criado_por = request.user

        grupo_id = validated_data.pop('grupo_id', None)
        grupo_obj = None
        if grupo_id:
            try:
                grupo_obj = Grupo.objects.get(id=grupo_id)
            except Grupo.DoesNotExist:
                pass

        projeto = Projeto.objects.create(
            criado_por=criado_por,
            grupo=grupo_obj,
            **validated_data
        )

        # Vincula membros do grupo automaticamente
        if grupo_obj:
            for membro in grupo_obj.membros.all():
                ProjetoMembro.objects.get_or_create(projeto=projeto, usuario=membro)

        # Adiciona criador como membro apenas se não for coordenador
        if not request.user.is_coordenador:
            ProjetoMembro.objects.get_or_create(projeto=projeto, usuario=criado_por)

        for tec in tecnologias:
            ProjetoTecnologia.objects.create(projeto=projeto, tecnologia=tec)

        for uid in membros_ids:
            try:
                u = Usuario.objects.get(id=uid)
                ProjetoMembro.objects.get_or_create(projeto=projeto, usuario=u)
            except Usuario.DoesNotExist:
                pass

        HistoricoVersao.objects.create(
            projeto=projeto, usuario=request.user,
            versao=1, acao='CRIACAO', descricao_mudanca='Projeto submetido.'
        )
        return projeto

    def update(self, instance, validated_data):
        request = self.context['request']
        if not request.user.is_coordenador and not instance.pode_editar():
            raise serializers.ValidationError(
                'Projeto não pode ser editado. Status atual: ' + instance.status
            )
        tecnologias = validated_data.pop('tecnologias', None)
        membros_ids = validated_data.pop('membros_ids', None)
        validated_data.pop('criado_por_id', None)
        conceito = validated_data.pop('conceito', None)
        feedback_geral = validated_data.pop('feedback_geral', None)
        status_anterior = instance.status

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        from avaliacoes.models import Avaliacao
        if request.user.is_coordenador:
            novo_status = instance.status
            if novo_status != 'AVALIADO':
                # Reverteu status — apaga avaliação existente
                Avaliacao.objects.filter(projeto=instance).delete()
            elif conceito:
                # Mantém ou cria avaliação com o conceito definido
                Avaliacao.objects.update_or_create(
                    projeto=instance,
                    defaults={
                        'professor': request.user,
                        'conceito': conceito,
                        'feedback_geral': feedback_geral or '',
                    }
                )

        if tecnologias is not None:
            instance.tecnologias.all().delete()
            for tec in tecnologias:
                ProjetoTecnologia.objects.create(projeto=instance, tecnologia=tec)

        ultima_versao = instance.historico.order_by('-versao').first()
        nova_versao = (ultima_versao.versao + 1) if ultima_versao else 1
        HistoricoVersao.objects.create(
            projeto=instance, usuario=request.user,
            versao=nova_versao, acao='EDICAO',
            descricao_mudanca='Projeto atualizado pelo aluno.',
            status_anterior=status_anterior
        )
        return instance
