import emailjs from '@emailjs/browser';

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Envía el código de confirmación de tutoría al alumno.
 * Configurar en EmailJS la plantilla con las variables:
 *   {{to_name}}, {{to_email}}, {{docente_name}},
 *   {{fecha}}, {{hora}}, {{codigo}}, {{expira}}
 */
export const enviarCodigoConfirmacion = async ({
  alumnoEmail, alumnoNombre, docenteNombre,
  fecha, hora, codigo, expira
}) => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS no configurado. Verifica tu .env');
    return { success: false, message: 'EmailJS no configurado' };
  }

  try {
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_name:      alumnoNombre,
        to_email:     alumnoEmail,
        docente_name: docenteNombre,
        fecha,
        hora,
        codigo,
        expira,
        reply_to:     'noreply@utn.edu.mx'
      },
      PUBLIC_KEY
    );

    return { success: true, result };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, message: error.text || 'Error al enviar correo' };
  }
};
