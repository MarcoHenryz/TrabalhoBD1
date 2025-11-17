#!/bin/bash

# 🎓 SCRIPT DE TESTE COMPLETO - SISTEMA DE AVALIAÇÕES
# Versão CORRIGIDA para consultar banco PostgreSQL corretamente

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

API_URL="http://localhost:8080"
SLEEP_TIME=0.5

# Funções auxiliares
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_section() {
    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
    echo -e "${MAGENTA}  $1${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_data() {
    echo -e "${CYAN}📋 $1${NC}"
}

extract_id() {
    echo "$1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

clear
print_header "🎓 TESTE COMPLETO - SISTEMA DE AVALIAÇÕES NOTAKI"
echo ""

# ═══════════════════════════════════════════════════════════
# FASE 1: SETUP - CRIAR USUÁRIOS E PERFIS
# ═══════════════════════════════════════════════════════════

print_section "FASE 1: CRIAR USUÁRIOS E PERFIS"

# 1. Criar usuário do professor
print_info "1.1 Criando usuário do professor..."
PROF_USUARIO=$(curl -s -X POST "$API_URL/usuarios" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "prof.db@uel.br",
        "senha": "senha123"
    }')

PROF_USUARIO_ID=$(extract_id "$PROF_USUARIO")
if [ -n "$PROF_USUARIO_ID" ]; then
    print_success "Usuário do professor criado"
    print_data "ID: $PROF_USUARIO_ID"
else
    print_error "Falha ao criar usuário do professor"
    exit 1
fi
sleep $SLEEP_TIME

# 2. Criar professor
print_info "1.2 Criando perfil de professor..."
PROFESSOR=$(curl -s -X POST "$API_URL/professores" \
    -H "Content-Type: application/json" \
    -d "{
        \"area\": \"Banco de Dados\",
        \"usuarioId\": \"$PROF_USUARIO_ID\"
    }")

PROFESSOR_ID=$(extract_id "$PROFESSOR")
if [ -n "$PROFESSOR_ID" ]; then
    print_success "Professor criado"
    print_data "ID: $PROFESSOR_ID"
else
    print_error "Falha ao criar professor"
    exit 1
fi
sleep $SLEEP_TIME

# 3. Criar usuário do aluno 1
print_info "1.3 Criando usuário do aluno 1..."
ALUNO1_USUARIO=$(curl -s -X POST "$API_URL/usuarios" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "aluno1@uel.br",
        "senha": "senha123"
    }')

ALUNO1_USUARIO_ID=$(extract_id "$ALUNO1_USUARIO")
if [ -n "$ALUNO1_USUARIO_ID" ]; then
    print_success "Usuário do aluno 1 criado"
    print_data "ID: $ALUNO1_USUARIO_ID"
else
    print_error "Falha ao criar usuário do aluno 1"
    exit 1
fi
sleep $SLEEP_TIME

# 4. Criar aluno 1
print_info "1.4 Criando perfil de aluno 1..."
ALUNO1=$(curl -s -X POST "$API_URL/alunos" \
    -H "Content-Type: application/json" \
    -d "{
        \"matricula\": \"2021001\",
        \"dataInicio\": \"2021-03-01\",
        \"usuarioId\": \"$ALUNO1_USUARIO_ID\"
    }")

ALUNO1_ID=$(extract_id "$ALUNO1")
if [ -n "$ALUNO1_ID" ]; then
    print_success "Aluno 1 criado"
    print_data "ID: $ALUNO1_ID | Matrícula: 2021001"
else
    print_error "Falha ao criar aluno 1"
    exit 1
fi
sleep $SLEEP_TIME

# 5. Criar usuário do aluno 2
print_info "1.5 Criando usuário do aluno 2..."
ALUNO2_USUARIO=$(curl -s -X POST "$API_URL/usuarios" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "aluno2@uel.br",
        "senha": "senha123"
    }')

ALUNO2_USUARIO_ID=$(extract_id "$ALUNO2_USUARIO")
if [ -n "$ALUNO2_USUARIO_ID" ]; then
    print_success "Usuário do aluno 2 criado"
    print_data "ID: $ALUNO2_USUARIO_ID"
else
    print_error "Falha ao criar usuário do aluno 2"
    exit 1
fi
sleep $SLEEP_TIME

# 6. Criar aluno 2
print_info "1.6 Criando perfil de aluno 2..."
ALUNO2=$(curl -s -X POST "$API_URL/alunos" \
    -H "Content-Type: application/json" \
    -d "{
        \"matricula\": \"2021002\",
        \"dataInicio\": \"2021-03-01\",
        \"usuarioId\": \"$ALUNO2_USUARIO_ID\"
    }")

ALUNO2_ID=$(extract_id "$ALUNO2")
if [ -n "$ALUNO2_ID" ]; then
    print_success "Aluno 2 criado"
    print_data "ID: $ALUNO2_ID | Matrícula: 2021002"
else
    print_error "Falha ao criar aluno 2"
    exit 1
fi
sleep $SLEEP_TIME

# ═══════════════════════════════════════════════════════════
# FASE 2: CRIAR BANCO DE QUESTÕES
# ═══════════════════════════════════════════════════════════

print_section "FASE 2: CRIAR BANCO DE QUESTÕES"

# 7. Criar questão múltipla escolha
print_info "2.1 Criando questão de múltipla escolha..."
QUESTAO_MC=$(curl -s -X POST "$API_URL/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"enunciado\": \"Qual comando SQL é usado para selecionar dados?\",
        \"tema\": \"SQL\",
        \"tipo\": \"MULTIPLA_ESCOLHA\",
        \"dificuldade\": \"FACIL\",
        \"professorId\": \"$PROFESSOR_ID\",
        \"alternativas\": [
            {\"alternativa\": \"SELECT\", \"verdadeiro\": true},
            {\"alternativa\": \"INSERT\", \"verdadeiro\": false},
            {\"alternativa\": \"UPDATE\", \"verdadeiro\": false},
            {\"alternativa\": \"DELETE\", \"verdadeiro\": false}
        ]
    }")

QUESTAO_MC_ID=$(extract_id "$QUESTAO_MC")
if [ -n "$QUESTAO_MC_ID" ]; then
    print_success "Questão múltipla escolha criada"
    print_data "ID: $QUESTAO_MC_ID"
else
    print_error "Falha ao criar questão múltipla escolha"
    exit 1
fi
sleep $SLEEP_TIME

# 8. Criar questão V/F
print_info "2.2 Criando questão Verdadeiro/Falso..."
QUESTAO_VF=$(curl -s -X POST "$API_URL/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"enunciado\": \"Marque V ou F sobre bancos de dados:\",
        \"tema\": \"Bancos de Dados\",
        \"tipo\": \"VOUF\",
        \"dificuldade\": \"MEDIO\",
        \"professorId\": \"$PROFESSOR_ID\",
        \"itensVouf\": [
            {\"item\": \"PostgreSQL é relacional\", \"verdadeiro\": true},
            {\"item\": \"MongoDB é relacional\", \"verdadeiro\": false},
            {\"item\": \"NoSQL não permite consultas\", \"verdadeiro\": false}
        ]
    }")

QUESTAO_VF_ID=$(extract_id "$QUESTAO_VF")
if [ -n "$QUESTAO_VF_ID" ]; then
    print_success "Questão V/F criada"
    print_data "ID: $QUESTAO_VF_ID"
else
    print_error "Falha ao criar questão V/F"
    exit 1
fi
sleep $SLEEP_TIME

# 9. Criar questão dissertativa
print_info "2.3 Criando questão dissertativa..."
QUESTAO_DISS=$(curl -s -X POST "$API_URL/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"enunciado\": \"Explique o conceito de normalização em bancos de dados.\",
        \"tema\": \"Normalização\",
        \"tipo\": \"DISSERTATIVA\",
        \"dificuldade\": \"DIFICIL\",
        \"respostaEsperada\": \"Normalização é o processo de organizar dados para reduzir redundância...\",
        \"professorId\": \"$PROFESSOR_ID\"
    }")

QUESTAO_DISS_ID=$(extract_id "$QUESTAO_DISS")
if [ -n "$QUESTAO_DISS_ID" ]; then
    print_success "Questão dissertativa criada"
    print_data "ID: $QUESTAO_DISS_ID"
else
    print_error "Falha ao criar questão dissertativa"
    exit 1
fi
sleep $SLEEP_TIME

# ═══════════════════════════════════════════════════════════
# FASE 2B: BUSCAR IDS DAS ALTERNATIVAS E ITENS V/F
# ═══════════════════════════════════════════════════════════

print_section "FASE 2B: BUSCAR ALTERNATIVAS E ITENS V/F DO BANCO"

# Buscar alternativa CORRETA (verdadeiro = t)
print_info "2B.1 Buscando alternativa correta da questão M.E..."
ALT_CORRETA=$(docker exec notaki_db psql -U notaki -d notaki -t -A -c \
    "SELECT id FROM alternativas WHERE questao_id = '$QUESTAO_MC_ID' AND verdadeiro = true LIMIT 1;")

ALT_CORRETA=$(echo "$ALT_CORRETA" | tr -d '[:space:]')

if [ -n "$ALT_CORRETA" ] && [ "$ALT_CORRETA" != "" ]; then
    print_success "Alternativa correta encontrada"
    print_data "ID: $ALT_CORRETA"
else
    print_error "Não encontrou alternativa correta"
    echo "Query retornou: '$ALT_CORRETA'"
    exit 1
fi
sleep $SLEEP_TIME

# Buscar alternativa ERRADA (verdadeiro = f)
print_info "2B.2 Buscando alternativa errada da questão M.E..."
ALT_ERRADA=$(docker exec notaki_db psql -U notaki -d notaki -t -A -c \
    "SELECT id FROM alternativas WHERE questao_id = '$QUESTAO_MC_ID' AND verdadeiro = false LIMIT 1;")

ALT_ERRADA=$(echo "$ALT_ERRADA" | tr -d '[:space:]')

if [ -n "$ALT_ERRADA" ]; then
    print_success "Alternativa errada encontrada"
    print_data "ID: $ALT_ERRADA"
else
    print_error "Não encontrou alternativa errada"
    exit 1
fi
sleep $SLEEP_TIME

# Buscar item V/F VERDADEIRO
print_info "2B.3 Buscando item V/F verdadeiro..."
VF_ITEM_VERDADEIRO=$(docker exec notaki_db psql -U notaki -d notaki -t -A -c \
    "SELECT id FROM vouf WHERE questao_id = '$QUESTAO_VF_ID' AND verdadeiro = true LIMIT 1;")

VF_ITEM_VERDADEIRO=$(echo "$VF_ITEM_VERDADEIRO" | tr -d '[:space:]')

if [ -n "$VF_ITEM_VERDADEIRO" ]; then
    print_success "Item V/F verdadeiro encontrado"
    print_data "ID: $VF_ITEM_VERDADEIRO"
else
    print_error "Não encontrou item V/F verdadeiro"
    exit 1
fi
sleep $SLEEP_TIME

# Buscar item V/F FALSO
print_info "2B.4 Buscando item V/F falso..."
VF_ITEM_FALSO=$(docker exec notaki_db psql -U notaki -d notaki -t -A -c \
    "SELECT id FROM vouf WHERE questao_id = '$QUESTAO_VF_ID' AND verdadeiro = false LIMIT 1;")

VF_ITEM_FALSO=$(echo "$VF_ITEM_FALSO" | tr -d '[:space:]')

if [ -n "$VF_ITEM_FALSO" ]; then
    print_success "Item V/F falso encontrado"
    print_data "ID: $VF_ITEM_FALSO"
else
    print_error "Não encontrou item V/F falso"
    exit 1
fi
sleep $SLEEP_TIME

# ═══════════════════════════════════════════════════════════
# FASE 3: CRIAR AVALIAÇÃO
# ═══════════════════════════════════════════════════════════

print_section "FASE 3: CRIAR E CONFIGURAR AVALIAÇÃO"

# 10. Criar avaliação
print_info "3.1 Criando avaliação..."
AVALIACAO=$(curl -s -X POST "$API_URL/avaliacoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"descricao\": \"Prova 1 - Banco de Dados\",
        \"data\": \"2025-12-15\",
        \"horario\": \"14:00:00\",
        \"professorId\": \"$PROFESSOR_ID\"
    }")

AVALIACAO_ID=$(extract_id "$AVALIACAO")
if [ -n "$AVALIACAO_ID" ]; then
    print_success "Avaliação criada"
    print_data "ID: $AVALIACAO_ID"
else
    print_error "Falha ao criar avaliação"
    exit 1
fi
sleep $SLEEP_TIME

# 11. Adicionar questões à avaliação
print_info "3.2 Adicionando questões à avaliação..."

# Questão 1 (múltipla escolha, peso 3.0)
curl -s -X POST "$API_URL/avaliacoes/$AVALIACAO_ID/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"questaoId\": \"$QUESTAO_MC_ID\",
        \"peso\": 3.0,
        \"ordem\": 1
    }" > /dev/null

print_success "Questão 1 adicionada (M.E., peso 3.0)"
sleep $SLEEP_TIME

# Questão 2 (V/F, peso 2.0)
curl -s -X POST "$API_URL/avaliacoes/$AVALIACAO_ID/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"questaoId\": \"$QUESTAO_VF_ID\",
        \"peso\": 2.0,
        \"ordem\": 2
    }" > /dev/null

print_success "Questão 2 adicionada (V/F, peso 2.0)"
sleep $SLEEP_TIME

# Questão 3 (dissertativa, peso 5.0)
curl -s -X POST "$API_URL/avaliacoes/$AVALIACAO_ID/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"questaoId\": \"$QUESTAO_DISS_ID\",
        \"peso\": 5.0,
        \"ordem\": 3
    }" > /dev/null

print_success "Questão 3 adicionada (Dissertativa, peso 5.0)"
sleep $SLEEP_TIME

# 12. Listar questões da avaliação
print_info "3.3 Listando questões da avaliação..."
QUESTOES_AVALIACAO=$(curl -s "$API_URL/avaliacoes/$AVALIACAO_ID/questoes")
TOTAL_QUESTOES=$(echo "$QUESTOES_AVALIACAO" | grep -o '"id"' | wc -l)

if [ "$TOTAL_QUESTOES" -ge 3 ]; then
    print_success "Avaliação tem questões configuradas"
else
    print_error "Esperado 3 questões, encontrado $TOTAL_QUESTOES"
fi
sleep $SLEEP_TIME

# 13. Associar alunos à avaliação
print_info "3.4 Associando alunos à avaliação..."

curl -s -X POST "$API_URL/avaliacoes/$AVALIACAO_ID/alunos" \
    -H "Content-Type: application/json" \
    -d "{\"alunoId\": \"$ALUNO1_ID\"}" > /dev/null

print_success "Aluno 1 associado à avaliação"
sleep $SLEEP_TIME

curl -s -X POST "$API_URL/avaliacoes/$AVALIACAO_ID/alunos" \
    -H "Content-Type: application/json" \
    -d "{\"alunoId\": \"$ALUNO2_ID\"}" > /dev/null

print_success "Aluno 2 associado à avaliação"
sleep $SLEEP_TIME

# ═══════════════════════════════════════════════════════════
# FASE 4: ALUNO 1 RESPONDE A PROVA
# ═══════════════════════════════════════════════════════════

print_section "FASE 4: ALUNO 1 FAZENDO A PROVA"

# 14. Aluno 1 responde questão 1 (múltipla escolha - ACERTA)
print_info "4.1 Aluno 1 respondendo questão 1 (múltipla escolha - ACERTA)..."
RESPOSTA1=$(curl -s -X POST "$API_URL/respostas" \
    -H "Content-Type: application/json" \
    -d "{
        \"avaliacaoId\": \"$AVALIACAO_ID\",
        \"alunoId\": \"$ALUNO1_ID\",
        \"questaoId\": \"$QUESTAO_MC_ID\",
        \"alternativaEscolhidaId\": \"$ALT_CORRETA\"
    }")

RESPOSTA1_ID=$(extract_id "$RESPOSTA1")
if [ -n "$RESPOSTA1_ID" ]; then
    print_success "Questão 1 respondida (acertou!)"
    print_data "Resposta ID: $RESPOSTA1_ID"
else
    print_error "Falha ao responder questão 1"
    echo "Response: $RESPOSTA1"
    exit 1
fi
sleep $SLEEP_TIME

# 15. Aluno 1 responde questão 2 (V/F - ACERTA)
print_info "4.2 Aluno 1 respondendo questão 2 (V/F - ACERTA)..."
RESPOSTA2=$(curl -s -X POST "$API_URL/respostas" \
    -H "Content-Type: application/json" \
    -d "{
        \"avaliacaoId\": \"$AVALIACAO_ID\",
        \"alunoId\": \"$ALUNO1_ID\",
        \"questaoId\": \"$QUESTAO_VF_ID\",
        \"voufItemId\": \"$VF_ITEM_VERDADEIRO\",
        \"voufResposta\": true
    }")

RESPOSTA2_ID=$(extract_id "$RESPOSTA2")
if [ -n "$RESPOSTA2_ID" ]; then
    print_success "Questão 2 respondida (V/F - acertou!)"
    print_data "Resposta ID: $RESPOSTA2_ID"
else
    print_error "Falha ao responder questão 2"
    echo "Response: $RESPOSTA2"
    exit 1
fi
sleep $SLEEP_TIME

# 16. Aluno 1 responde questão 3 (dissertativa)
print_info "4.3 Aluno 1 respondendo questão 3 (dissertativa)..."
RESPOSTA3=$(curl -s -X POST "$API_URL/respostas" \
    -H "Content-Type: application/json" \
    -d "{
        \"avaliacaoId\": \"$AVALIACAO_ID\",
        \"alunoId\": \"$ALUNO1_ID\",
        \"questaoId\": \"$QUESTAO_DISS_ID\",
        \"respostaTexto\": \"Normalização é o processo de organizar os dados em um banco de dados relacional para reduzir redundância e melhorar a integridade dos dados. As formas normais (1FN, 2FN, 3FN) definem regras progressivas para eliminar dependências e grupos repetitivos.\"
    }")

RESPOSTA3_ID=$(extract_id "$RESPOSTA3")
if [ -n "$RESPOSTA3_ID" ]; then
    print_success "Questão 3 respondida (dissertativa)"
    print_data "Resposta ID: $RESPOSTA3_ID"
else
    print_error "Falha ao responder questão 3"
    echo "Response: $RESPOSTA3"
    exit 1
fi
sleep $SLEEP_TIME

# 17. Ver todas as respostas do aluno 1
print_info "4.4 Verificando respostas do aluno 1..."
RESPOSTAS_ALUNO1=$(curl -s "$API_URL/respostas/avaliacao/$AVALIACAO_ID/aluno/$ALUNO1_ID")
TOTAL_RESPOSTAS=$(echo "$RESPOSTAS_ALUNO1" | grep -o '"id"' | wc -l)

if [ "$TOTAL_RESPOSTAS" -ge 3 ]; then
    print_success "Aluno 1 respondeu as questões"
    print_data "Total: $TOTAL_RESPOSTAS respostas"
else
    print_error "Esperado 3 respostas, encontrado $TOTAL_RESPOSTAS"
fi
sleep $SLEEP_TIME

# ═══════════════════════════════════════════════════════════
# FASE 5: ALUNO 2 RESPONDE A PROVA (COM ERROS)
# ═══════════════════════════════════════════════════════════

print_section "FASE 5: ALUNO 2 FAZENDO A PROVA"

# 18. Aluno 2 responde questão 1 (múltipla escolha - ERRA)
print_info "5.1 Aluno 2 respondendo questão 1 (múltipla escolha - ERRA)..."
curl -s -X POST "$API_URL/respostas" \
    -H "Content-Type: application/json" \
    -d "{
        \"avaliacaoId\": \"$AVALIACAO_ID\",
        \"alunoId\": \"$ALUNO2_ID\",
        \"questaoId\": \"$QUESTAO_MC_ID\",
        \"alternativaEscolhidaId\": \"$ALT_ERRADA\"
    }" > /dev/null

print_success "Questão 1 respondida (errou)"
sleep $SLEEP_TIME

# 19. Aluno 2 responde questão 2 (V/F - ERRA)
print_info "5.2 Aluno 2 respondendo questão 2 (V/F - ERRA)..."
curl -s -X POST "$API_URL/respostas" \
    -H "Content-Type: application/json" \
    -d "{
        \"avaliacaoId\": \"$AVALIACAO_ID\",
        \"alunoId\": \"$ALUNO2_ID\",
        \"questaoId\": \"$QUESTAO_VF_ID\",
        \"voufItemId\": \"$VF_ITEM_VERDADEIRO\",
        \"voufResposta\": false
    }" > /dev/null

print_success "Questão 2 respondida (errou)"
sleep $SLEEP_TIME

# 20. Aluno 2 responde questão 3 (dissertativa - resposta curta)
print_info "5.3 Aluno 2 respondendo questão 3 (dissertativa)..."
RESPOSTA_ALUNO2_DISS=$(curl -s -X POST "$API_URL/respostas" \
    -H "Content-Type: application/json" \
    -d "{
        \"avaliacaoId\": \"$AVALIACAO_ID\",
        \"alunoId\": \"$ALUNO2_ID\",
        \"questaoId\": \"$QUESTAO_DISS_ID\",
        \"respostaTexto\": \"Normalização é organizar dados no banco.\"
    }")

RESPOSTA_ALUNO2_DISS_ID=$(extract_id "$RESPOSTA_ALUNO2_DISS")
print_success "Questão 3 respondida (dissertativa fraca)"
print_data "Resposta ID: $RESPOSTA_ALUNO2_DISS_ID"
sleep $SLEEP_TIME

# ═══════════════════════════════════════════════════════════
# FASE 6: PROFESSOR CORRIGE DISSERTATIVAS
# ═══════════════════════════════════════════════════════════

print_section "FASE 6: PROFESSOR CORRIGINDO DISSERTATIVAS"

# 21. Professor corrige dissertativa do aluno 1 (nota boa)
print_info "6.1 Professor corrigindo dissertativa do aluno 1..."
curl -s -X PUT "$API_URL/respostas/$RESPOSTA3_ID/corrigir" \
    -H "Content-Type: application/json" \
    -d '{"nota": 0.95}' > /dev/null

print_success "Dissertativa do aluno 1 corrigida com nota 0.95 (95%)"
sleep $SLEEP_TIME

# 22. Professor corrige dissertativa do aluno 2 (nota baixa)
print_info "6.2 Professor corrigindo dissertativa do aluno 2..."
curl -s -X PUT "$API_URL/respostas/$RESPOSTA_ALUNO2_DISS_ID/corrigir" \
    -H "Content-Type: application/json" \
    -d '{"nota": 0.40}' > /dev/null

print_success "Dissertativa do aluno 2 corrigida com nota 0.40 (40%)"
sleep $SLEEP_TIME

# ═══════════════════════════════════════════════════════════
# FASE 7: CALCULAR NOTAS FINAIS
# ═══════════════════════════════════════════════════════════

print_section "FASE 7: CALCULAR NOTAS FINAIS"

# 23. Calcular nota do aluno 1
print_info "7.1 Calculando nota final do aluno 1..."
NOTA_ALUNO1=$(curl -s "$API_URL/respostas/avaliacao/$AVALIACAO_ID/aluno/$ALUNO1_ID/nota-final")

print_success "Nota final do aluno 1:"
print_data "Nota: $NOTA_ALUNO1"
sleep $SLEEP_TIME

# 24. Calcular nota do aluno 2
print_info "7.2 Calculando nota final do aluno 2..."
NOTA_ALUNO2=$(curl -s "$API_URL/respostas/avaliacao/$AVALIACAO_ID/aluno/$ALUNO2_ID/nota-final")

print_success "Nota final do aluno 2:"
print_data "Nota: $NOTA_ALUNO2"
sleep $SLEEP_TIME

# ═══════════════════════════════════════════════════════════
# FASE 8: VERIFICAR NO BANCO DE DADOS
# ═══════════════════════════════════════════════════════════

print_section "FASE 8: VERIFICAR NO BANCO DE DADOS"

print_info "8.1 Conectando no PostgreSQL..."

docker exec -i notaki_db psql -U notaki -d notaki <<EOF
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 USUÁRIOS E PERFIS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
SELECT 'Usuários:' as tipo, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'Professores:', COUNT(*) FROM professores
UNION ALL
SELECT 'Alunos:', COUNT(*) FROM alunos;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📚 QUESTÕES'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
SELECT tipo, COUNT(*) as total FROM questoes GROUP BY tipo;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📝 AVALIAÇÕES'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
SELECT descricao, data, 
       (SELECT COUNT(*) FROM avaliacao_questoes WHERE avaliacao_id = avaliacoes.id) as questoes,
       (SELECT COUNT(*) FROM avaliacao_alunos WHERE avaliacao_id = avaliacoes.id) as alunos
FROM avaliacoes;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✍️  RESPOSTAS DOS ALUNOS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
SELECT 
    a.matricula,
    COUNT(*) as total_respostas,
    SUM(CASE WHEN r.corrigido THEN 1 ELSE 0 END) as corrigidas,
    ROUND(AVG(r.nota)::numeric, 2) as media_nota
FROM respostas_alunos r
JOIN alunos a ON a.id = r.aluno_id
GROUP BY a.matricula
ORDER BY a.matricula;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 NOTAS POR ALUNO (DETALHADO)'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
SELECT 
    a.matricula as aluno,
    q.tipo as tipo_questao,
    CASE 
        WHEN r.corrigido THEN CONCAT(ROUND((r.nota * 10)::numeric, 1), '/10')
        ELSE 'Não corrigida'
    END as nota
FROM respostas_alunos r
JOIN alunos a ON a.id = r.aluno_id
JOIN questoes q ON q.questao_id = r.questao_id
ORDER BY a.matricula, q.tipo;
EOF

echo ""

# ═══════════════════════════════════════════════════════════
# RELATÓRIO FINAL
# ═══════════════════════════════════════════════════════════

print_section "RELATÓRIO FINAL"
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ TESTE COMPLETO FINALIZADO!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📋 RESUMO:${NC}"
echo -e "${CYAN}  • 1 Professor criado${NC}"
echo -e "${CYAN}  • 2 Alunos criados${NC}"
echo -e "${CYAN}  • 3 Questões criadas (M.E., V/F, Dissertativa)${NC}"
echo -e "${CYAN}  • 1 Avaliação configurada${NC}"
echo -e "${CYAN}  • 3 Questões adicionadas à avaliação${NC}"
echo -e "${CYAN}  • 2 Alunos fizeram a prova${NC}"
echo -e "${CYAN}  • 6 Respostas registradas${NC}"
echo -e "${CYAN}  • Correção automática funcionando ✨${NC}"
echo -e "${CYAN}  • Correção manual funcionando ✨${NC}"
echo -e "${CYAN}  • Cálculo de notas funcionando ✨${NC}"
echo ""
echo -e "${MAGENTA}📊 IDs para referência:${NC}"
echo -e "${MAGENTA}  Professor: $PROFESSOR_ID${NC}"
echo -e "${MAGENTA}  Aluno 1: $ALUNO1_ID (Nota: $NOTA_ALUNO1)${NC}"
echo -e "${MAGENTA}  Aluno 2: $ALUNO2_ID (Nota: $NOTA_ALUNO2)${NC}"
echo -e "${MAGENTA}  Avaliação: $AVALIACAO_ID${NC}"
echo ""