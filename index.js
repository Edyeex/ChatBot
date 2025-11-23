const userSessions = {};
const qrcode = require('qrcode-terminal');

const {Client, LocalAuth} = require('whatsapp-web.js');
const client = new Client({authStrategy: new LocalAuth()});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});


client.on('ready', () => {
    console.log('Está tudo pronto!');
});

client.on('message_create', async (message) => {
    console.log(message.body);
    const userID = message.from;


    if(message.body.toLocaleLowerCase() === 'iniciar') {
        message.reply('Iniciando pesquisa...');
        userSessions[userID] = {
            STEP: 0,
            ANSWERS: [],
            SCORES: {
                'Cientista de dados/ IA': 0,
                'Desenvolvedor Front-end': 0,
                'Desenvolvedor Back-end': 0,
                'DevOps': 0,
                'QA (Quality Assurance)': 0,
                'UX/UI Designer': 0,
                'Gestão de Produtos': 0
            }
        }

        message.reply('Iniciando a sua avaliação de perfil profissional...');
        await new Promise(resolve => setTimeout (resolve, 2000));
        await sendQuestion(message, userID);

    }else if(userSessions[userID]) {
        await processAnswer(message, userID);
    }      
});

const perguntas = [
    {
        pergunta: "*Como você prefere trabalhar?*\n\n1 - Analisando dados e padrões\n2 - Criando interfaces visuais atraentes\n3 - Otimizando processos e infraestrutura\n4 - Desenvolvendo a lógica do sistema\n5 - Testando e garantindo qualidade\n6 - Projetando experiências do usuário\n7 - Planejando e coordenando equipes",
        opcoes: {
            '1':{'Cientista de dados/ IA': 3},
            '2':{'Desenvolvedor Front-end': 3},
            '3':{'Desenvolvedor Back-end': 3},
            '4':{'DevOps': 3},
            '5':{'QA (Quality Assurance)': 3},
            '6':{'UX/UI Designer': 3},
            '7':{'Gestão de Produtos': 3}
        }
    },
    {
        pergunta:"*O que mais te motiva?*\n\n1 - Descobrir insights em dados complexos\n2 - Ver seu design ganhar vida no navegador\n3 - Manter sistemas estáveis e eficientes\n4 - Resolver problemas complexos com código\n5 - Encontrar e corrigir bugs\n6 - Tornar produtos mais usáveis e bonitos\n7 - Liderar projetos do conceito à realidade",
        opcoes: {
            '1':{'Cientista de dados/ IA': 2, 'Desenvolvedor Back-end': 1},
            '2':{'Desenvolvedor Front-end': 3, 'UX/UI Designer': 1},
            '3':{'Desenvolvedor Back-end': 3},
            '4':{'DevOps': 3},
            '5':{'QA (Quality Assurance)': 3},
            '6':{'UX/UI Designer': 3},
            '7':{'Gestão de Produtos': 3}
        },
    },
    {
        pergunta: "*Qual destas ferramentas te atrai mais?*\n\n1 - Python, Machine Learning\n2 - React, CSS, JavaScript\n3 - Docker, Kubernetes, AWS\n4 - Node.js, Java, Bancos de Dados\n5 - Selenium, Test Automation\n6 - Figma, Adobe XD\n7 - Jira, Metodologias Ágeis",
        opcoes: {
            '1':{'Cientista de dados/ IA': 3},
            '2':{'Desenvolvedor Front-end': 3},
            '3':{'DevOps': 3},
            '4':{'Desenvolvedor Back-end': 3},
            '5':{'QA (Quality Assurance)': 3},
            '6':{'UX/UI Designer': 3},
            '7':{'Gestão de Produtos': 3}
        }
    },
    {
        pergunta: "*Seu maior talento é?*\n\n1 - Pensamento analítico e matemático\n2 - Criatividade e atenção a detalhes visuais\n3 - Organização e resolução de problemas técnicos\n4 - Lógica de programação e arquitetura\n5 - Paciência e visão crítica\n6 - Empatia e compreensão do usuário\n7 - Comunicação e planejamento estratégico",
        opcoes: {
            '1':{'Cientista de dados/ IA': 2},
            '2':{'Desenvolvedor Front-end': 1, 'UX/UI Designer': 2},
            '3':{'DevOps': 2, 'Desenvolvedor Back-end': 1},
            '4':{'Desenvolvedor Back-end': 2},
            '5':{'QA (Quality Assurance)': 3},
            '6':{'UX/UI Designer': 2},
            '7':{'Gestão de Produtos': 3}
        }
    },
    {
        pergunta: "*Qual destes projetos te animaria mais?*\n\n1 - Prever tendências de mercado com IA\n2 - Criar um site interativo e responsivo\n3 - Implementar deployment automático\n4 - Desenvolver uma API robusta\n5 - Garantir que um app não tenha bugs\n6 - Redesenhar a experiência do usuário\n7 - Gerenciar o lançamento de um novo produto",
        opcoes: {
            '1':{'Cientista de dados/ IA': 3},
            '2':{'Desenvolvedor Front-end': 3},
            '3':{'DevOps': 3},
            '4':{'Desenvolvedor Back-end': 3},
            '5':{'QA (Quality Assurance)': 3},
            '6':{'UX/UI Designer': 3},
            '7':{'Gestão de Produtos': 3}
        }
    }
];

async function sendQuestion(message, userID) {
    const session = userSessions[userID];
    if(session.STEP < perguntas.length) {
        const currentQuestion = perguntas[session.STEP];
        message.reply(`*Pergunta ${session.step + 1}/${perguntas.length}*\n\n${currentQuestion.pergunta}`);
    }else {
        await mostrarResultado(message, userID);
    }
}
async function processAnswer(message, userID) {
    const session = userSessions[userID];
    const resposta = message.body.trim();

    if(perguntas>= '1' && resposta <= '7') {
        const currentQuestion = perguntas[session.STEP];

        if(currentQuestion.opcoes[resposta]) {
            Object.entries(currentQuestion.opcoes[resposta]).forEach(([role, score]) => {
                session.SCORES[role] += score;
            });
        }
        session.STEP++;
        await sendQuestion(message, userID);
    }else {
        message.reply('Por favor, responda com um número válido entre 1 e 7.');
    }
}
async function mostrarResultado(message, userID) {
    const session = userSessions[userID];
    
    let topArea = '';
    let topScore = -1;

    Object.entries(session.SCORES).forEach(([role, score]) => {
        if(score > topScore) {
            topScore = score;
            topArea = role;
        }
    });

    message.reply(`Sua área ideal é: *${topArea}* com pontuação ${topScore}.`);
    delete userSessions[userID];
}

client.initialize();