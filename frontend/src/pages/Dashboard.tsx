import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FRASES_INSPIRACIONALES = [
  "Fuerte no es el que nunca se quiebra, fuerte es el que se quiebra, llora, se arma y sigue eligiendo vivir...",
  "Lo que niegas te somete, lo que aceptas te transforma. - Carl Jung",
  "El curioso caso de que cuando me acepto a mí mismo, es cuando puedo cambiar. - Carl Rogers",
  "No somos lo que nos ha pasado, somos lo que decidimos ser. - Carl Jung",
  "No puedes detener las olas, pero puedes aprender a surfear. - Jon Kabat-Zinn",
  "La herida es el lugar por donde la luz entra en ti. - Rumi",
  "Conocer tu propia oscuridad es el mejor método para lidiar con la oscuridad de los demás. - Carl Jung",
  "Incluso la noche más oscura terminará y el sol saldrá. - Victor Hugo",
  "Quien mira afuera, sueña; quien mira adentro, despierta. - Carl Jung",
  "Hasta que lo inconsciente no se haga consciente, el subconsciente dirigirá tu vida y tú le llamarás destino. - Carl Jung",
  "La buena vida es un proceso, no un estado del ser. Es una dirección, no un destino. - Carl Rogers",
  "En todo ser humano hay una tendencia natural hacia la actualización y el crecimiento. - Carl Rogers",
  "Un fracaso no es siempre un error, puede ser simplemente lo mejor que se puede hacer en esas circunstancias. - B.F. Skinner",
  "La vulnerabilidad no es ganar o perder; es tener el valor de aparecer y ser visto cuando no tenemos control. - Brené Brown",
  "El zapato que le ajusta a un hombre le aprieta a otro; no hay receta para la vida que funcione en todos los casos. - Carl Jung",
  "No hay árbol que sus ramas alcancen el cielo, si sus raíces no llegan al infierno. - Carl Jung",
  "Soltar no es decir adiós, es decir gracias y seguir adelante.",
  "Tu visión se aclarará solamente cuando puedas mirar en tu propio corazón. - Carl Jung",
  "Lo más aterrador es aceptarse a uno mismo por completo. - Carl Jung",
  "No estoy en esta vida para cumplir las expectativas de otras personas, ni siento que el mundo deba cumplir las mías. - Fritz Perls",
  "La resiliencia es la capacidad del ser humano para hacer frente a las adversidades y salir fortalecido de ellas. - Boris Cyrulnik",
  "Aquel que tiene un 'porqué' para vivir, puede soportar casi cualquier 'cómo'. - Viktor Frankl",
  "Entre el estímulo y la respuesta hay un espacio. En ese espacio está nuestro poder de elegir nuestra respuesta. - Viktor Frankl",
  "Cuando ya no somos capaces de cambiar una situación, nos encontramos ante el desafío de cambiarnos a nosotros mismos. - Viktor Frankl",
  "Todo puede serle arrebatado a un hombre, menos la última de las libertades humanas: elegir su actitud. - Viktor Frankl",
  "A veces el acto de valentía más grande es simplemente pedir ayuda.",
  "Sanar no significa que el daño nunca existió, significa que el daño ya no controla nuestras vidas.",
  "Si no te gusta algo, cámbialo. Si no puedes cambiarlo, cambia tu actitud. - Maya Angelou",
  "La vida es un 10% lo que te sucede y un 90% cómo reaccionas a ello. - Charles R. Swindoll",
  "Nadie se ilumina imaginando figuras de luz, sino por hacer consciente la oscuridad. - Carl Jung",
  "El gran descubrimiento de mi generación es que podemos alterar nuestras vidas alterando nuestras actitudes mentales. - William James",
  "Toda persona tiene la capacidad de cambiar si se le proporciona el clima psicológico adecuado. - Carl Rogers",
  "El autoconocimiento no es una garantía de felicidad, pero está del lado de la felicidad. - Karen Horney",
  "Donde hay amor hay vida, y donde hay dolor, hay sanación.",
  "Las emociones inexpresadas nunca mueren. Son enterradas vivas y salen más tarde de peores formas. - Sigmund Freud",
  "El privilegio de tu vida es convertirse en quien realmente eres. - Carl Jung",
  "No hay deber que descuidemos tanto como el deber de ser felices. - Robert Louis Stevenson"
];

export const Dashboard = () => {
  const [fraseDelDia, setFraseDelDia] = useState(FRASES_INSPIRACIONALES[0]);

  useEffect(() => {
    const fraseAleatoria = FRASES_INSPIRACIONALES[Math.floor(Math.random() * FRASES_INSPIRACIONALES.length)];
    setFraseDelDia(fraseAleatoria);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Section - Inspirado en Imagen 1 (Psicología) */}
      <div className="bg-warm-100 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-warm-200">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-warm-900 leading-tight min-h-[120px] flex items-center">
            "{fraseDelDia}"
          </h1>
          
          <Link to="/turnos" className="inline-flex bg-warm-700 hover:bg-warm-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all items-center gap-2 mt-4">
            Ver Agenda Completa <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div 
          className="w-64 h-64 md:w-80 md:h-80 shrink-0 relative flex items-center justify-center"
          style={{
            WebkitMaskImage: 'radial-gradient(circle closest-side, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            maskImage: 'radial-gradient(circle closest-side, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
          }}
        >
          <img src="/images/profesional.jpg" alt="Foto Profesional" className="w-full h-full object-cover mix-blend-multiply" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4 bg-warm-50 rounded-2xl text-warm-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Total Pacientes Activos</h3>
            <p className="text-3xl font-serif font-bold text-warm-900">124</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4 bg-brand-50 rounded-2xl text-brand-600">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Turnos Programados Hoy</h3>
            <p className="text-3xl font-serif font-bold text-brand-800">5</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-warm-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Próximo Turno</h3>
            <p className="text-xl font-serif font-bold text-gray-800">15:00 hs</p>
            <p className="text-sm text-gray-500">María González</p>
          </div>
        </div>

      </div>
    </div>
  );
};
