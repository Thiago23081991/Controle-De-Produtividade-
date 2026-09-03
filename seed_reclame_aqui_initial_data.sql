-- =======================================================
-- CARGA INICIAL: Reclame Aqui (36 registros)
-- Execute este script no SQL Editor do Supabase
-- =======================================================

INSERT INTO reclame_aqui (
    registro_ra, nota_fiscal, data_postagem, consumidor, entrada, 
    status_atual, chamado, email, data_contato, resposta_publica, 
    patologia_causa, voltaria_fazer_negocio, resolvido, nota_avaliacao, 
    moderacao, visita_tecnica, data_replica, data_treplica, 
    procedente, mo, produto, registrado_por
) VALUES
('252605339', 'N', '29/06/2026', 'Davidson Lutkenhaus', 'Tintas Suvinil - BASF', '11987487481 - Aguardando auxilio equipe Suvinil', '2281435', '', '01/07/2026', '', 'Patologia - Diferença de tonalidade e atendimento', '-', '-', '-', '-', '-', '-', '-', '', '', '', 'IMPORTAÇÃO'),
('253335295', 'N', '07/07/2026', 'Eliseu Vieira', 'Tintas Suvinil - BASF', 'Aguardando aprovação de pagamento', '2384893', '2384893', '24/8/2026', '', 'Manchamento', '', '', '', '', 'Técnico - Fábio SWB', '', '', '', '', '', 'IMPORTAÇÃO'),
('253613551', 'N', '07/10/2026', 'Gabryel J. S. Andrade', 'Tintas Suvinil - BASF', 'O cliente confirmou que recebeu o pagamento.', '2527030', '2527030', '18/8/2026', '', 'Cobertura', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('253629655', 'S', '07/10/2026', 'Leandro Z. Brandão', 'Tintas Suvinil - BASF', 'O cliente confirmou que recebeu o pagamento.', '2272446', '2272446', '08/11/2026', 'SIM', 'Extração Solúvel', 'SIM', 'SIM', '10', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('INDECX', '*', '27/07/2026', 'Icaro B. Silva', 'Tintas Suvinil - BASF', 'O cliente confirmou que recebeu o pagamento.', '2301696', '2301696', '19/8/2026', 'SIM', 'NPS - Improcedente', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('254913871', 'S', '27/07/2026', 'Vivian M. M. Hirayama', 'Tintas Suvinil - BASF', 'O cliente confirmou que recebeu o pagamento.', '2521874', '2521874', '14/8/2026', 'SIM', 'Diferença de Tonalidade', 'SIM', 'SIM', '10', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('255389427', 'S', '08/01/2026', 'Graziella F. Radavelli', 'Tintas Suvinil - BASF', 'O cliente confirmou que recebeu o pagamento.', '2609792', '2609792', '21/8/2026', 'SIM', 'Cobertura', 'SIM', 'SIM', '10', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('255524457', 'N', '08/03/2026', 'Tiago Henrique P. Capistrano', 'Tintas Suvinil - BASF', 'Aguardando aprovação de pagamento', '2610260', '2610260', '31/8/2026', '', 'Cobertura', '', '', '', '', '', '', '', 'S', 'R$750,00', 'R$1.721,16', 'IMPORTAÇÃO'),
('255170281', 'S', '29/7/2026', 'Ana Paula F. dos Santos', 'Tintas Suvinil - BASF', 'Aguardando cadastro MDG', '2600112', '2600112', '31/8/2026', '', 'Cobertura', 'SIM', 'SIM', '9', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('253569283', 'S', '07/10/2026', 'Conrado M. Gurgel', 'Tintas Suvinil - BASF', 'Aguardando NC', '2178567', '2178567', '27/8/2026', '', 'Diferença de Tonalidade', 'SIM', 'SIM', '10', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('255528367', 'N', '08/03/2026', 'Davi Lungatti', 'Tintas Suvinil - BASF', 'RESPONDIDO - Aguardando retorno do cliente', '2605291', '2605291', '24/8/2026', 'SIM', 'Secagem', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('255900645', 'N', '08/07/2026', 'Luiz Setim', 'Tintas Suvinil - BASF', 'Aguardando aprovação de pagamento', '2441616', '2441616', '18/8/2026', '', 'Craquelamento', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('255145025', 'N', '29/7/2026', 'Isabela Betarelli', 'Tintas Suvinil - BASF', 'A cliente confirmou o recebimento do valor', '2588256', '2588256', '09/01/2026', 'N', 'Limpeza', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('255912871', 'S', '08/10/2026', 'Stevan Milutinovic', 'Tintas Suvinil - Lojas Online', 'O cliente confirmou que recebeu o pedido.', '2636687', '2636687', '20/08/2026', 'SIM', 'Entrega', 'SIM', 'SIM', '9', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('256013185', 'N', '08/09/2026', 'Maisa Batista', 'Tintas Suvinil - BASF', 'RESPONDIDO - Aguardando retorno do cliente', '2655219', '2655219', '21/08/2026', 'SIM', 'Marcas / Manchamento', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('256023781', 'N', '08/10/2026', 'Rubia Toffano', 'Tintas Suvinil - BASF', 'RESPONDIDO - Aguardando retorno do cliente', '2665120', '2665120', '27/08/2026', 'N', 'Descascamento', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('256040761', 'N', '08/10/2026', 'Tatiane Cristina de Souza', 'Tintas Suvinil - BASF', 'Data de pagamento 07/09/2026', '2665461', '2665461', '09/01/2026', 'N', 'Manchamento', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('256206091', 'N', '08/11/2026', 'Ana Lilian B. Grillo', 'Tintas Suvinil - Lojas Online', 'Aguardando confirmação de troca', '2637043', '2637043', '09/01/2026', 'N', 'Troca Parcial', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('256256285', 'S', '08/12/2026', 'Tatiane da S. Andrigh', 'Tintas Suvinil - BASF', 'MODERAÇÃO Aceita', '2531726', '2531726', '20/08/2026', 'SIM', 'Cobertura', 'NÃO', 'NÃO', '0', '', '', '', '', 'NÃO', '', '', 'IMPORTAÇÃO'),
('256698317', 'N', '17/08/2026', 'Jackeline Marvila', 'Tintas Suvinil - BASF', 'Data de pagamento 07/09/2026', '2657901', '2657901', '09/01/2026', 'N', 'Névoas', '', '', '', '', '', '', '', 'SIM', '', '', 'IMPORTAÇÃO'),
('256709895', 'N', '17/08/2026', 'Alexsandra Matos', 'Tintas Suvinil - Lojas Online', 'RESPONDIDO', '2689739', '2689739', '26/08/2026', 'SIM', 'Leque de cores', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('256712933', 'N', '17/08/2026', 'Renato T. Takeyama', 'Tintas Suvinil - BASF', 'Aguardando retorno do cliente', '2689810', '2689810', '31/08/2026', 'N', 'Desbotamento', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('256748525', 'N', '18/08/2026', 'Gabriele Dias', 'Tintas Suvinil - BASF', 'RESPONDIDO - RÉPLICA', '2653629', '2653629', '26/08/2026', 'SIM', 'Cobertura', '', '', '', '', '', '26/08/26', '29/08/26', 'NÃO', '', '', 'IMPORTAÇÃO'),
('256789733', 'N', '18/08/2026', 'Wandercy de O. Braga', 'Tintas Suvinil - BASF', 'DESATIVADO - Pagamento 31/08/2026', '2451862', '2451862', '27/08/2026', 'N', 'Névoas', '', '', '', '', '', '', '', 'SIM', '', '', 'IMPORTAÇÃO'),
('256861777', 'N', '19/08/2026', 'Regiane S. Gregorio', 'Tintas Suvinil - BASF', 'Aguardando retorno do André - Não Procedente', '2695162', '2695162', '31/08/2026', 'N', 'Manchamento', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('256861797', 'N', '19/08/2026', 'Paulo Henrique F. Santos', 'Tintas Suvinil - BASF', 'Aguardando retorno do cliente', '2695315', '2695315', '31/08/2026', 'N', 'Manchas de Atrito', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('257001633', 'N', '20/08/2026', 'Carolina Godoy', 'Tintas Suvinil - BASF', 'Aguardando retorno do cliente', '2702709', '2702709', '31/08/2026', 'N', 'Consistência', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('257132553', 'N', '22/08/2026', 'Juliano L. Siqueira', 'Tintas Suvinil - BASF', 'Aguardando dados bancários', '2485463', '2485463', '09/01/2026', 'N', 'Consistência', '', '', '', '', '', '', '', 'NÃO', '', '', 'IMPORTAÇÃO'),
('257193643', 'N', '24/08/2026', 'Ana Carolina', 'Tintas Suvinil - Lojas Online', 'Aguardando retorno da cliente', '2707656', '2707656', '09/01/2026', 'N', 'Atraso na entrega', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('257303575', 'N', '25/08/2026', 'Claudia Regina Pereira', 'Tintas Suvinil - BASF', 'Aguardando cadastro MDG', '2663671', '2663671', '31/08/2026', 'N', 'Corte-Recorte', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('257308725', 'N', '25/08/2026', 'Fernando Gonzaga', 'Tintas Suvinil - BASF', 'Aguardando dados bancários', '2566283', '2566283', '31/08/2026', 'N', 'Diferença de Tonalidade', '', '', '', '', '', '', '', 'SIM', '', '', 'IMPORTAÇÃO'),
('257342281', 'S', '25/08/2026', 'José Ventin', 'Tintas Suvinil - BASF', 'Moderação Aceita', '2688779', '2688779', '29/08/2026', 'SIM', 'CHAT - Cores', 'NÃO', 'NÃO', '0', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('257427007', 'N', '26/08/2026', 'Rafaele Vieira', 'Tintas Suvinil - Lojas Online', 'RESPONDIDO', '2693572', '2693572', '29/08/2026', 'SIM', 'Cancelamento', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('257522103', 'N', '27/08/2026', 'Ana Paula Leonardo Toledo', 'Tintas Suvinil - BASF', 'Migração para Coral', '2708541', '2708541', '31/08/2026', 'N', 'Extração Solúvel', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO'),
('257566705', 'N', '27/08/2026', 'Beatriz C. Icardo', 'Tintas Suvinil - BASF', 'Aguardando dados bancários', '2479529', '2479529', '31/08/2026', 'N', 'Viscosidade', '', '', '', '', '', '', '', 'NÃO', '', '', 'IMPORTAÇÃO'),
('257724959', 'N', '29/08/2026', 'Brenda Gomes', 'Tintas Suvinil - BASF', 'Aguardando retorno da cliente', '2714159', '2714159', '31/08/2026', 'N', 'Odor', '', '', '', '', '', '', '', '', '', '', 'IMPORTAÇÃO');
