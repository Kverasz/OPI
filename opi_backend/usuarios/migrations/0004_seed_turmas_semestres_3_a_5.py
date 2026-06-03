from django.db import migrations


TURMAS = [
    # ADS — semestres 3, 4, 5
    {'codigo': 'ADS-62',  'nome': 'ADS 62',  'turno': 'MANHA', 'ano': 2026, 'semestre': 3},
    {'codigo': 'ADS-75',  'nome': 'ADS 75',  'turno': 'TARDE', 'ano': 2026, 'semestre': 3},
    {'codigo': 'ADS-110', 'nome': 'ADS 110', 'turno': 'NOITE', 'ano': 2026, 'semestre': 3},
    {'codigo': 'ADS-33',  'nome': 'ADS 33',  'turno': 'MANHA', 'ano': 2026, 'semestre': 4},
    {'codigo': 'ADS-58',  'nome': 'ADS 58',  'turno': 'TARDE', 'ano': 2026, 'semestre': 4},
    {'codigo': 'ADS-144', 'nome': 'ADS 144', 'turno': 'NOITE', 'ano': 2026, 'semestre': 4},
    {'codigo': 'ADS-19',  'nome': 'ADS 19',  'turno': 'MANHA', 'ano': 2026, 'semestre': 5},
    {'codigo': 'ADS-66',  'nome': 'ADS 66',  'turno': 'NOITE', 'ano': 2026, 'semestre': 5},
    # Design — semestres 3, 4, 5
    {'codigo': 'DES-21',  'nome': 'Design 21', 'turno': 'MANHA', 'ano': 2026, 'semestre': 3},
    {'codigo': 'DES-47',  'nome': 'Design 47', 'turno': 'TARDE', 'ano': 2026, 'semestre': 3},
    {'codigo': 'DES-63',  'nome': 'Design 63', 'turno': 'NOITE', 'ano': 2026, 'semestre': 4},
    {'codigo': 'DES-88',  'nome': 'Design 88', 'turno': 'MANHA', 'ano': 2026, 'semestre': 4},
    {'codigo': 'DES-14',  'nome': 'Design 14', 'turno': 'TARDE', 'ano': 2026, 'semestre': 5},
    {'codigo': 'DES-76',  'nome': 'Design 76', 'turno': 'NOITE', 'ano': 2026, 'semestre': 5},
    # Gastronomia — semestres 3, 4, 5
    {'codigo': 'GAST-18', 'nome': 'Gastronomia 18', 'turno': 'MANHA', 'ano': 2026, 'semestre': 3},
    {'codigo': 'GAST-44', 'nome': 'Gastronomia 44', 'turno': 'TARDE', 'ano': 2026, 'semestre': 3},
    {'codigo': 'GAST-67', 'nome': 'Gastronomia 67', 'turno': 'NOITE', 'ano': 2026, 'semestre': 4},
    {'codigo': 'GAST-82', 'nome': 'Gastronomia 82', 'turno': 'MANHA', 'ano': 2026, 'semestre': 4},
    {'codigo': 'GAST-29', 'nome': 'Gastronomia 29', 'turno': 'TARDE', 'ano': 2026, 'semestre': 5},
    {'codigo': 'GAST-73', 'nome': 'Gastronomia 73', 'turno': 'NOITE', 'ano': 2026, 'semestre': 5},
]


def seed_turmas(apps, schema_editor):
    Turma = apps.get_model('usuarios', 'Turma')
    for t in TURMAS:
        Turma.objects.get_or_create(codigo=t['codigo'], defaults=t)


def remove_turmas(apps, schema_editor):
    Turma = apps.get_model('usuarios', 'Turma')
    Turma.objects.filter(codigo__in=[t['codigo'] for t in TURMAS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0003_seed_turmas'),
    ]

    operations = [
        migrations.RunPython(seed_turmas, remove_turmas),
    ]
