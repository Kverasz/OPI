from django.db import migrations


TURMAS = [
    # ADS
    {'codigo': 'ADS-23',  'nome': 'ADS 23',  'turno': 'MANHA', 'ano': 2026, 'semestre': 1},
    {'codigo': 'ADS-47',  'nome': 'ADS 47',  'turno': 'TARDE', 'ano': 2026, 'semestre': 1},
    {'codigo': 'ADS-98',  'nome': 'ADS 98',  'turno': 'NOITE', 'ano': 2026, 'semestre': 1},
    {'codigo': 'ADS-121', 'nome': 'ADS 121', 'turno': 'MANHA', 'ano': 2026, 'semestre': 2},
    {'codigo': 'ADS-185', 'nome': 'ADS 185', 'turno': 'NOITE', 'ano': 2026, 'semestre': 2},
    # Design
    {'codigo': 'DES-12',  'nome': 'Design 12',  'turno': 'MANHA', 'ano': 2026, 'semestre': 1},
    {'codigo': 'DES-34',  'nome': 'Design 34',  'turno': 'TARDE', 'ano': 2026, 'semestre': 1},
    {'codigo': 'DES-98',  'nome': 'Design 98',  'turno': 'NOITE', 'ano': 2026, 'semestre': 2},
    # Gastronomia
    {'codigo': 'GAST-31', 'nome': 'Gastronomia 31', 'turno': 'MANHA', 'ano': 2026, 'semestre': 1},
    {'codigo': 'GAST-55', 'nome': 'Gastronomia 55', 'turno': 'TARDE', 'ano': 2026, 'semestre': 2},
]


def seed_turmas(apps, schema_editor):
    Turma = apps.get_model('usuarios', 'Turma')
    for t in TURMAS:
        Turma.objects.get_or_create(codigo=t['codigo'], defaults=t)


def remove_turmas(apps, schema_editor):
    Turma = apps.get_model('usuarios', 'Turma')
    codigos = [t['codigo'] for t in TURMAS]
    Turma.objects.filter(codigo__in=codigos).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0002_usuario_curso'),
    ]

    operations = [
        migrations.RunPython(seed_turmas, remove_turmas),
    ]
