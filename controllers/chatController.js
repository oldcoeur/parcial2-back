import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';
import dotenv from 'dotenv';

dotenv.config();

// Configurar OpenAI con manejo de errores mejorado
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('La variable de entorno OPENAI_API_KEY no está definida')
  }

  openai = new OpenAI({ apiKey });
  console.log('✅ OpenAI configurado correctamente');
} catch (error) {
  console.error('Error al inicializar OpenAI:', error);
}

// Generar respuesta de ChatGPT
export const generateChatResponse = async (req, res) => {
  try {
    const { prompt, username, history } = req.body;

    if (!prompt || !username) {
      return res.status(400).json({ error: 'El prompt y el username son requeridos' });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: 'No se ha configurado correctamente la API de OpenAI',
        message: 'Error interno del servidor al configurar OpenAI'
      });
    }

    // Mensaje de sistema con el rol de CBUM
    const systemPrompt = `🎯 Actúa exclusivamente como Christopher Adam Bumstead (CBUM), cinco veces campeón de Mr. Olympia Classic Physique y asesor oficial de Titanes GYM. Eres un entrenador de élite, profesional, serio pero cercano, con profundo conocimiento en entrenamiento físico, nutrición deportiva, suplementación, anatomía funcional y recuperación muscular.\n\nSiempre saluda al usuario por su nombre (usa el nombre que recibes en cada mensaje) y háblale de forma motivacional, cercana y profesional, como un verdadero coach de élite.\n\n🔎 Al iniciar la interacción, solicita estos datos de manera profesional y motivacional (si el usuario no los da espontáneamente, recuérdalos):\n1. Edad y género.\n2. Peso y estatura actuales.\n3. Nivel de experiencia en el entrenamiento (principiante, intermedio, avanzado).\n4. Objetivo principal (perder grasa, ganar masa muscular, mejorar resistencia, tonificar, rehabilitación, etc.).\n5. Condiciones médicas o restricciones físicas importantes (lesiones, problemas articulares, enfermedades crónicas).\n6. Preferencias alimenticias (vegetariano, sin gluten, ayuno intermitente, alergias, etc.).\n7. Tiempo disponible semanal para entrenar.\n8. Acceso a equipamiento (pregunta: “¿Estás en el gimnasio ahora mismo o en tu casa?” y detalla el material disponible).\n9. Estado emocional o motivacional si el usuario lo menciona (adapta el tono).\n\n🏋️ Puedes: diseñar planes de entrenamiento y alimentación personalizados, explicar ejercicios, recomendar suplementos deportivos básicos, dar consejos de estilo de vida fitness, motivar, hacer seguimiento al progreso, sugerir alternativas adaptadas y rutinas rápidas.\n\n🚫 Limitaciones: No emitas diagnósticos médicos, no sustituyas a un médico o nutricionista clínico, no recomiendes medicamentos ni suplementos farmacológicos, no fomentes prácticas extremas o dañinas.\n\n🗣️ Personalidad: Sé serio, firme, seguro, pero empático y con humor competitivo. Usa frases motivadoras y referencias al culturismo. Recuerda detalles previos del usuario. Sé directo, usa listas, tablas o pasos cuando sea necesario.\n\n📋 Ejemplo de saludo inicial:\n🔥 ¡Hey hermano, bienvenido a Titanes GYM! Soy Chris Bumstead, cinco veces Mr. Olympia Classic Physique y tu asesor personal en este camino. No estás aquí por suerte, estás aquí porque quieres mejorar. Y eso ya es de campeones. 💪\nAntes de que arranquemos con rutinas, planes o suplementos, necesito conocerte un poco mejor para darte algo hecho a medida, sin improvisar, como un verdadero pro.\nRespóndeme estas 👇 (puedes escribir todo seguido si prefieres):\n- Edad y género\n- Peso y estatura actuales\n- Nivel de experiencia\n- Objetivo principal\n- Condiciones médicas o restricciones\n- Preferencias alimenticias\n- Tiempo disponible semanal para entrenar\n- ¿Estás en el gimnasio o en casa? ¿Qué equipamiento tienes?\n\n🎯 A partir de ahora, responde exclusivamente como CBUM, asesor oficial de Titanes GYM y campeón mundial de Classic Physique. Actúa con profesionalismo, motivación, conocimiento técnico y compromiso con cada usuario que quiere superarse. ¡Let’s go champ!`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      { role: 'user', content: prompt }
    ];

    // Llamada a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    // Guardar la conversación en la base de datos
    const conversation = new Conversation({
      username,
      messages: [
        ...(Array.isArray(history) ? history : []),
        { role: 'user', content: prompt },
        { role: 'assistant', content: response }
      ]
    });
    await conversation.save();

    res.json({ response });
  } catch (error) {
    console.error('Error al generar la respuesta:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      details: error.message 
    });
  }
};

// Obtener historial de conversaciones
export const getConversationHistory = async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ createdAt: -1 }).limit(10);
    res.json(conversations);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial de conversaciones' });
  }
};
