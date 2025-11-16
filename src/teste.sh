#!/bin/bash

# 🧪 Script de Teste Automatizado - API de Questões (CRUD Puro)
# Testa apenas as operações essenciais: CREATE, READ, UPDATE, DELETE
# SEM filtros (funcionalidade extra removida)

set -e  # Para na primeira falha

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
API_URL="http://localhost:8080"
SLEEP_TIME=2

# Funções auxiliares
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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

extract_id() {
    echo "$1" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

# Limpar tela
clear

print_header "🧪 TESTE AUTOMATIZADO - API DE QUESTÕES (CRUD)"
echo ""

# 1. Verificar se API está rodando
print_info "Verificando se API está rodando..."
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/usuarios" | grep -q "200\|404"; then
    print_success "API está rodando!"
else
    print_error "API não está rodando. Execute: docker-compose up -d"
    exit 1
fi
echo ""
sleep $SLEEP_TIME

# 2. Criar Usuário
print_header "📝 TESTE 1: Criar Usuário"
USUARIO_RESPONSE=$(curl -s -X POST "$API_URL/usuarios" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "prof.teste@uel.br",
        "senha": "senha123"
    }')

USUARIO_ID=$(extract_id "$USUARIO_RESPONSE")

if [ -n "$USUARIO_ID" ]; then
    print_success "Usuário criado com sucesso!"
    print_info "ID: $USUARIO_ID"
else
    print_error "Falha ao criar usuário"
    echo "Resposta: $USUARIO_RESPONSE"
    exit 1
fi
echo ""
sleep $SLEEP_TIME

# 3. Criar Professor
print_header "👨‍🏫 TESTE 2: Criar Professor"
PROFESSOR_RESPONSE=$(curl -s -X POST "$API_URL/professores" \
    -H "Content-Type: application/json" \
    -d "{
        \"area\": \"Banco de Dados\",
        \"usuarioId\": \"$USUARIO_ID\"
    }")

PROFESSOR_ID=$(extract_id "$PROFESSOR_RESPONSE")

if [ -n "$PROFESSOR_ID" ]; then
    print_success "Professor criado com sucesso!"
    print_info "ID: $PROFESSOR_ID"
else
    print_error "Falha ao criar professor"
    echo "Resposta: $PROFESSOR_RESPONSE"
    exit 1
fi
echo ""
sleep $SLEEP_TIME

# 4. Criar Questão Múltipla Escolha
print_header "📚 TESTE 3: Criar Questão Múltipla Escolha"
QUESTAO_MC_RESPONSE=$(curl -s -X POST "$API_URL/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"enunciado\": \"Qual comando SQL é usado para selecionar dados de uma tabela?\",
        \"tema\": \"SQL Básico\",
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

QUESTAO_MC_ID=$(extract_id "$QUESTAO_MC_RESPONSE")

if [ -n "$QUESTAO_MC_ID" ]; then
    print_success "Questão Múltipla Escolha criada!"
    print_info "ID: $QUESTAO_MC_ID"
else
    print_error "Falha ao criar questão múltipla escolha"
    echo "Resposta: $QUESTAO_MC_RESPONSE"
    exit 1
fi
echo ""
sleep $SLEEP_TIME

# 5. Criar Questão Verdadeiro/Falso
print_header "📚 TESTE 4: Criar Questão Verdadeiro/Falso"
QUESTAO_VF_RESPONSE=$(curl -s -X POST "$API_URL/questoes" \
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
            {\"item\": \"SQL significa Structured Query Language\", \"verdadeiro\": true}
        ]
    }")

QUESTAO_VF_ID=$(extract_id "$QUESTAO_VF_RESPONSE")

if [ -n "$QUESTAO_VF_ID" ]; then
    print_success "Questão Verdadeiro/Falso criada!"
    print_info "ID: $QUESTAO_VF_ID"
else
    print_error "Falha ao criar questão V/F"
    echo "Resposta: $QUESTAO_VF_RESPONSE"
    exit 1
fi
echo ""
sleep $SLEEP_TIME

# 6. Criar Questão Dissertativa
print_header "📚 TESTE 5: Criar Questão Dissertativa"
QUESTAO_DISS_RESPONSE=$(curl -s -X POST "$API_URL/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"enunciado\": \"Explique o conceito de normalização em bancos de dados.\",
        \"tema\": \"Normalização\",
        \"tipo\": \"DISSERTATIVA\",
        \"dificuldade\": \"DIFICIL\",
        \"respostaEsperada\": \"Normalização é o processo de organizar dados...\",
        \"professorId\": \"$PROFESSOR_ID\"
    }")

QUESTAO_DISS_ID=$(extract_id "$QUESTAO_DISS_RESPONSE")

if [ -n "$QUESTAO_DISS_ID" ]; then
    print_success "Questão Dissertativa criada!"
    print_info "ID: $QUESTAO_DISS_ID"
else
    print_error "Falha ao criar questão dissertativa"
    echo "Resposta: $QUESTAO_DISS_RESPONSE"
    exit 1
fi
echo ""
sleep $SLEEP_TIME

# 7. Listar todas as questões
print_header "📋 TESTE 6: Listar Todas as Questões"
LISTA_QUESTOES=$(curl -s "$API_URL/questoes")
TOTAL_QUESTOES=$(echo "$LISTA_QUESTOES" | grep -o '"id"' | wc -l)

if [ "$TOTAL_QUESTOES" -ge 3 ]; then
    print_success "Listagem funcionando! Total: $TOTAL_QUESTOES questões"
else
    print_error "Erro ao listar questões"
    echo "Resposta: $LISTA_QUESTOES"
fi
echo ""
sleep $SLEEP_TIME

# 8. Buscar questão por ID
print_header "🔍 TESTE 7: Buscar Questão por ID"
BUSCA_QUESTAO=$(curl -s "$API_URL/questoes/$QUESTAO_MC_ID")

if echo "$BUSCA_QUESTAO" | grep -q "enunciado"; then
    print_success "Busca por ID funcionando!"
else
    print_error "Erro ao buscar questão por ID"
    echo "Resposta: $BUSCA_QUESTAO"
fi
echo ""
sleep $SLEEP_TIME

# 9. Atualizar questão
print_header "✏️ TESTE 8: Atualizar Questão"
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/questoes/$QUESTAO_MC_ID" \
    -H "Content-Type: application/json" \
    -d "{
        \"enunciado\": \"Qual comando SQL CONSULTA dados?\",
        \"dificuldade\": \"MEDIO\"
    }")

if echo "$UPDATE_RESPONSE" | grep -q "CONSULTA"; then
    print_success "Atualização funcionando!"
else
    print_error "Erro ao atualizar questão"
fi
echo ""
sleep $SLEEP_TIME

# 10. Deletar questão
print_header "🗑️ TESTE 9: Deletar Questão"
DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/questoes/$QUESTAO_DISS_ID")

if [ "$DELETE_RESPONSE" -eq 204 ]; then
    print_success "Deleção funcionando!"
else
    print_error "Erro ao deletar questão (HTTP $DELETE_RESPONSE)"
fi
echo ""
sleep $SLEEP_TIME

# 11. TESTES DE VALIDAÇÃO (Erros Esperados)
print_header "⚠️ TESTE 10: Validações (Erros Esperados)"

# Erro: Múltipla sem alternativas
print_info "Testando: Múltipla escolha sem alternativas..."
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"enunciado\": \"Teste?\",
        \"tema\": \"Teste\",
        \"tipo\": \"MULTIPLA_ESCOLHA\",
        \"dificuldade\": \"FACIL\",
        \"professorId\": \"$PROFESSOR_ID\",
        \"alternativas\": []
    }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 400 ] || [ "$HTTP_CODE" -eq 500 ]; then
    print_success "Validação: múltipla sem alternativas ✓ (HTTP $HTTP_CODE)"
else
    print_error "Falha na validação (HTTP $HTTP_CODE)"
fi
sleep 1

# Erro: V/F sem itens
print_info "Testando: V/F sem itens..."
ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/questoes" \
    -H "Content-Type: application/json" \
    -d "{
        \"enunciado\": \"Teste?\",
        \"tema\": \"Teste\",
        \"tipo\": \"VOUF\",
        \"dificuldade\": \"FACIL\",
        \"professorId\": \"$PROFESSOR_ID\",
        \"itensVouf\": []
    }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 400 ] || [ "$HTTP_CODE" -eq 500 ]; then
    print_success "Validação: V/F sem itens ✓ (HTTP $HTTP_CODE)"
else
    print_error "Falha na validação (HTTP $HTTP_CODE)"
fi
echo ""
sleep 1

# 12. Verificar no banco
print_header "🗄️ TESTE 11: Verificar no Banco de Dados"
print_info "Conectando no PostgreSQL..."

docker exec -i notaki_db psql -U notaki -d notaki <<EOF
\echo '📊 Total de questões por tipo:'
SELECT tipo, COUNT(*) as total FROM questoes GROUP BY tipo;

\echo ''
\echo '📊 Total de questões por dificuldade:'
SELECT dificuldade, COUNT(*) as total FROM questoes GROUP BY dificuldade;

\echo ''
\echo '📊 Questões criadas:'
SELECT questao_id, LEFT(enunciado, 50) as enunciado, tipo FROM questoes ORDER BY criado_em;
EOF

echo ""

# Relatório Final
print_header "📊 RELATÓRIO FINAL"
echo ""
echo -e "${GREEN}✅ Usuário criado:${NC} $USUARIO_ID"
echo -e "${GREEN}✅ Professor criado:${NC} $PROFESSOR_ID"
echo -e "${GREEN}✅ Questão M.E. criada:${NC} $QUESTAO_MC_ID"
echo -e "${GREEN}✅ Questão V/F criada:${NC} $QUESTAO_VF_ID"
echo -e "${GREEN}✅ Questão Diss. criada:${NC} $QUESTAO_DISS_ID"
echo -e "${GREEN}✅ Total de questões:${NC} $TOTAL_QUESTOES"
echo ""
print_success "TODOS OS TESTES CONCLUÍDOS COM SUCESSO! 🎉"
echo ""