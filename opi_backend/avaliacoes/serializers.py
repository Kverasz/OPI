from rest_framework import serializers
from .models import CriterioRubrica, Avaliacao, AvaliacaoCriterio
from usuarios.serializers import UsuarioSerializer


class CriterioRubricaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriterioRubrica
        fields = '__all__'


class AvaliacaoCriterioSerializer(serializers.ModelSerializer):
    criterio = CriterioRubricaSerializer(read_only=True)
    criterio_id = serializers.PrimaryKeyRelatedField(
        queryset=CriterioRubrica.objects.filter(ativo=True),
        source='criterio', write_only=True
    )

    class Meta:
        model = AvaliacaoCriterio
        fields = ['id', 'criterio', 'criterio_id', 'conceito', 'comentario']


class AvaliacaoSerializer(serializers.ModelSerializer):
    professor = UsuarioSerializer(read_only=True)
    criterios = AvaliacaoCriterioSerializer(many=True, read_only=True)

    class Meta:
        model = Avaliacao
        fields = [
            'id', 'projeto', 'professor', 'conceito',
            'feedback_geral', 'avaliado_em', 'atualizado_em', 'criterios'
        ]
        read_only_fields = ['id', 'professor', 'avaliado_em', 'atualizado_em']


class AvaliacaoCriarSerializer(serializers.ModelSerializer):
    criterios = AvaliacaoCriterioSerializer(many=True)
    # Declaração explícita sem UniqueValidator para suportar revisão (update_or_create)
    projeto = serializers.PrimaryKeyRelatedField(
        queryset=__import__('projetos.models', fromlist=['Projeto']).Projeto.objects.all()
    )

    class Meta:
        model = Avaliacao
        fields = ['projeto', 'conceito', 'feedback_geral', 'rubrica_assinatura', 'criterios']

    def validate(self, data):
        criterios_ativos = CriterioRubrica.objects.filter(ativo=True)
        ids_enviados = {c['criterio'].id for c in data.get('criterios', [])}
        ids_necessarios = set(criterios_ativos.values_list('id', flat=True))
        if ids_necessarios - ids_enviados:
            raise serializers.ValidationError(
                'Todos os critérios ativos devem ser avaliados antes de salvar.'
            )
        return data

    def create(self, validated_data):
        criterios_data = validated_data.pop('criterios')
        request = self.context['request']
        projeto = validated_data.pop('projeto')

        from projetos.models import HistoricoVersao
        status_anterior = projeto.status
        projeto.status = 'AVALIADO'
        projeto.em_avaliacao_por = None
        projeto.save(update_fields=['status', 'em_avaliacao_por'])

        # Cria ou atualiza a avaliação (suporta revisão)
        avaliacao, criada = Avaliacao.objects.update_or_create(
            projeto=projeto,
            defaults={
                'professor': request.user,
                **validated_data,
            }
        )

        # Recria os critérios (apaga os antigos e insere novos)
        avaliacao.criterios.all().delete()
        for crit in criterios_data:
            AvaliacaoCriterio.objects.create(avaliacao=avaliacao, **crit)

        HistoricoVersao.objects.create(
            projeto=projeto, usuario=request.user,
            versao=projeto.historico.count() + 1,
            acao='AVALIACAO' if criada else 'REVISAO_AVALIACAO',
            descricao_mudanca=f'{"Avaliação registrada" if criada else "Avaliação revisada"}. Conceito: {avaliacao.conceito}',
            status_anterior=status_anterior
        )

        if criada:
            from feed.models import Notificacao
            Notificacao.objects.create(
                usuario=projeto.criado_por,
                tipo='AVALIACAO_CONCLUIDA',
                mensagem=f'Seu projeto "{projeto.titulo}" foi avaliado! Conceito: {avaliacao.conceito}',
                referencia_id=projeto.id
            )
        return avaliacao
