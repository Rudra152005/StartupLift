import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            // Common
            "welcome": "Welcome back",
            "settings": "Settings",
            "save_changes": "Save Changes",
            "search": "Search...",
            "loading": "Loading...",
            "logout": "Logout",
            "cancel": "Cancel",
            "delete": "Delete",
            "edit": "Edit",

            // Sidebar
            "overview": "Overview",
            "profile": "Profile",
            "programs": "Programs",
            "mentorship": "Mentorship",
            "resources": "Resources",
            "tracker": "Tracker",
            "messages": "Messages",
            "network": "Network",
            "my_startups": "My Startups",
            "my_mentees": "My Mentees",
            "admin_panel": "Admin Panel",
            "user_management": "User Management",
            "mentor_management": "Mentor Management",
            "startup_management": "Startup Management",
            "mentorship_sessions": "Mentorship Sessions",
            "content_management": "Content Management",
            "reports_analytics": "Reports & Analytics",
            "platform_logs": "Platform Logs",
            "mentorship_requests": "Mentorship Requests",
            "funding_requests": "Funding Requests",
            "sessions_calendar": "Sessions Calendar",
            "tasks_feedback": "Tasks & Feedback",
            "dashboard": "Dashboard",
            "home": "Home",
            "about": "About Us",
            "contact": "Contact",
            "my_profile": "My Profile",
            "main_administration": "Main Administration",
            "system_navigator": "System Navigator",
            "startup_founder": "Startup Founder",
            "light_mode": "Light Mode",
            "dark_mode": "Dark Mode",

            // Settings Sections
            "profile_details": "Profile Details",
            "notifications": "Notifications",
            "privacy": "Privacy",
            "preferences": "Preferences",
            "security": "Security",
            "active_sessions": "Active Sessions",
            "platform_settings": "Platform Settings",

            // User Preferences
            "email_address": "Enter your email",
            "language": "Language",
            "theme": "Theme",
            "light": "Light",
            "dark": "Dark",
            "system": "System",
            "customize_experience": "Customize your dashboard experience.",
            "select_appearance": "Select your preferred appearance.",
            "select_language": "Choose your preferred language.",
            "english": "English",
            "hindi": "Hindi",
            "spanish": "Spanish",

            // Profile Form
            "full_name": "Full Name",
            "email_address": "Email Address",
            "phone_number": "Phone Number",
            "company_startup": "Company / Startup",
            "linkedin_profile": "LinkedIn Profile",
            "bio_about": "Bio / About",
            "job_title": "Job Title",
            "years_experience": "Years of Experience",
            "expertise": "Expertise",
            "change_avatar": "Change Avatar",
            "manage_profile": "Manage your public profile and personal information.",

            // Security
            "current_password": "Current Password",
            "new_password": "New Password",
            "confirm_password": "Confirm Password",
            "update_password": "Update Password",
            "password_protection": "Protect your account with strong authentication.",

            // Notifications
            "notification_preferences": "Notification Preferences",
            "choose_updates": "Choose what updates you want to receive.",
            "mentor_responses": "Mentor Responses",
            "mentor_responses_desc": "Get notified when mentors respond to your requests.",
            "session_reminders": "Session Reminders",
            "session_reminders_desc": "Receive reminders 1 hour before scheduled sessions.",
            "platform_updates": "Platform Updates",
            "platform_updates_desc": "Stay updated with new features and improvements.",
            "marketing_emails": "Marketing & Newsletter",
            "marketing_emails_desc": "Receive tips, trends, and startup insights.",

            // Privacy
            "privacy_settings": "Privacy Settings",
            "manage_visibility": "Manage who can see your profile and details.",
            "profile_visibility": "Profile Visibility",
            "profile_visibility_desc": "Control who can view your full profile.",
            "show_email": "Show Email Address",
            "show_email_desc": "Allow others to see your email on your profile.",
            "show_phone": "Show Phone Number",
            "show_phone_desc": "Allow others to see your phone number on your profile.",

            // Sessions
            "manage_sessions": "Manage your active sessions logged in on other devices.",
            "current_device": "Current Device",

            // Landing Page Navbar & Common
            "vision": "Vision",
            "faq": "FAQ",
            "go_back": "Go Back",
            "create_account": "Create Account",
            "startups": "Startups",
            "start_pitch": "Start a Pitch",
            "browse_projects": "Browse Projects",

            // Hero Section
            "hero_subtitle": "Empowering Next-Gen Entrepreneurs",
            "hero_title_1": "Pitch Your Startup,",
            "hero_title_2": "Connect With Entrepreneurs",
            "hero_description": "Submit your startup ideas, explore innovative pitches, and shine in virtual competitions with a sleek, user-friendly platform.",
            "joined_by": "Joined by 10,000+ founders",
            "growth_stat": "+128% Growth",
            "last_month": "Last Month",

            // Startups Section
            "fresh_ideas": "Fresh Ideas on the",
            "horizon": "Horizon",
            "startups_desc": "Discover the latest high-growth ventures and disruptive technologies joining our ecosystem.",
            "view_all_startups": "View all startups",
            "sync_ecosystem": "Synchronizing Startup Ecosystem...",
            "details": "Details",

            // Vision Section
            "vision_title": "Where vision meets execution.",
            "vision_desc": "We provide the infrastructure so you can focus on the innovation.",
            "feature_1_title": "Seamless Networking",
            "feature_1_desc": "Connect with like-minded innovators and expand your entrepreneurial circle globally.",
            "feature_2_title": "Empowering Startups",
            "feature_2_desc": "Celebrate your journey and achievements while preparing for even greater opportunities ahead.",
            "feature_3_title": "Keyboard Quick Actions",
            "feature_3_desc": "Boost your productivity with intuitive shortcuts designed for effortless navigation and creation.",

            // Tools Section
            "tools_title": "Works Seamlessly with Your Tools",
            "tools_desc": "Integrate with the stack you already love.",

            // FAQ Section
            "faq_main_title": "Questions? We've got answers.",
            "faq_1_q": "What makes StartupLift unique?",
            "faq_1_a": "We focus on a community-driven approach, combining mentorship from day one with a platform designed for rapid iteration and feedback.",
            "faq_2_q": "What kind of exposure can I expect?",
            "faq_2_a": "Your startup will be visible to our network of 10,000+ founders, investors, and early adopters who are eager to test and support new ideas.",
            "faq_3_q": "Is there a fee to join?",
            "faq_3_a": "Joining the community is free. We offer premium tiers for advanced analytics and direct investor introductions.",
            "faq_4_q": "How do I update my project?",
            "faq_4_a": "You can update your project details, milestones, and pitch deck at any time directly from your dashboard.",

            // Footer
            "footer_brand_desc": "Empowering the next generation of founders to scale smarter through elite mentorship, strategic funding, and a global support network.",
            "quick_protocols": "Quick Protocols",
            "newsletter_title": "Join Our Newsletter",
            "newsletter_desc": "Get curated startup insights and updates.",
            "subscribe": "Subscribe",
            "all_rights_reserved": "All rights reserved.",
            "privacy_policy": "Privacy Policy",
            "terms_of_service": "Terms of Service"
        }
    },
    hi: {
        translation: {
            // Common
            "welcome": "वापस स्वागत है",
            "settings": "सेटिंग्स",
            "save_changes": "परिवर्तन सहेजें",
            "search": "खोजें...",
            "loading": "लोड हो रहा है...",
            "logout": "लॉगआउट",
            "cancel": "रद्द करें",
            "delete": "हटाएं",
            "edit": "संपादित करें",

            // Sidebar
            "overview": "अवलोकन",
            "profile": "प्रोफ़ाइल",
            "programs": "कार्यक्रम",
            "mentorship": "मेंटरशिप",
            "resources": "संसाधन",
            "tracker": "ट्रैकर",
            "messages": "संदेश",
            "network": "नेटवर्क",
            "my_startups": "मेरे स्टार्टअप",
            "my_mentees": "मेरे मेंटी",
            "admin_panel": "एडमिन पैनल",
            "user_management": "उपयोगकर्ता प्रबंधन",
            "mentor_management": "मेंटर प्रबंधन",
            "startup_management": "स्टार्टअप प्रबंधन",
            "mentorship_sessions": "मेंटरशिप सत्र",
            "content_management": "सामग्री प्रबंधन",
            "reports_analytics": "रिपोर्ट और विश्लेषण",
            "platform_logs": "प्लेटफॉर्म लॉग",
            "mentorship_requests": "मेंटरशिप अनुरोध",
            "funding_requests": "वित्त पोषण अनुरोध",
            "sessions_calendar": "सत्र कैलेंडर",
            "tasks_feedback": "कार्य और प्रतिक्रिया",
            "dashboard": "डैशबोर्ड",
            "home": "होम",
            "about": "हमारे बारे में",
            "contact": "संपर्क",
            "my_profile": "मेरी प्रोफ़ाइल",
            "main_administration": "मुख्य प्रशासन",
            "system_navigator": "सिस्टम नेविगेटर",
            "startup_founder": "स्टार्टअप संस्थापक",
            "light_mode": "लाइट मोड",
            "dark_mode": "डार्क मोड",

            // Settings Sections
            "profile_details": "प्रोफ़ाइल विवरण",
            "notifications": "सूचनाएं",
            "privacy": "गोपनीयता",
            "preferences": "प्राथमिकताएं",
            "security": "सुरक्षा",
            "active_sessions": "सक्रिय सत्र",
            "platform_settings": "प्लेटफॉर्म सेटिंग्स",

            // User Preferences
            "language": "भाषा",
            "theme": "थीम",
            "light": "हल्का",
            "dark": "गहरा",
            "system": "सिस्टम",
            "choose_language": "अपनी पसंदीदा भाषा चुनें।",
            "select_theme": "अपनी पसंदीदा उपस्थिति चुनें।",
            "customize_dashboard": "अपने डैशबोर्ड अनुभव को कस्टमाइज़ करें।",

            // Profile Form
            "full_name": "पूरा नाम",
            "email_address": "ईमेल पता",
            "phone_number": "फ़ोन नंबर",
            "company_startup": "कंपनी / स्टार्टअप",
            "linkedin_profile": "लिंक्डइन प्रोफ़ाइल",
            "bio_about": "बायो / बारे में",
            "job_title": "पद",
            "years_experience": "अनुभव के वर्ष",
            "expertise": "विशेषज्ञता",
            "change_avatar": "अवतार बदलें",
            "manage_profile": "अपनी सार्वजनिक प्रोफ़ाइल और व्यक्तिगत जानकारी प्रबंधित करें।",

            // Security
            "current_password": "वर्तमान पासवर्ड",
            "new_password": "नया पासवर्ड",
            "confirm_password": "पासवर्ड की पुष्टि करें",
            "update_password": "पासवर्ड अपडेट करें",
            "password_protection": "मजबूत प्रमाणीकरण के साथ अपने खाते की सुरक्षा करें।",

            // Notifications
            "notification_preferences": "सूचना प्राथमिकताएं",
            "choose_updates": "चुनें कि आप कौन से अपडेट प्राप्त करना चाहते हैं।",
            "mentor_responses": "मेंटर प्रतिक्रियाएं",
            "mentor_responses_desc": "जब मेंटर आपके अनुरोधों का जवाब देते हैं तो सूचित हों।",
            "session_reminders": "सत्र अनुस्मारक",
            "session_reminders_desc": "निर्धारित सत्रों से 1 घंटे पहले अनुस्मारक प्राप्त करें।",
            "platform_updates": "प्लेटफॉर्म अपडेट",
            "platform_updates_desc": "नई सुविधाओं और सुधारों के साथ अपडेट रहें।",
            "marketing_emails": "मार्केटिंग और न्यूज़लेटर",
            "marketing_emails_desc": "युक्ति, रुझान और स्टार्टअप अंतर्दृष्टि प्राप्त करें।",

            // Privacy
            "privacy_settings": "गोपनीयता सेटिंग्स",
            "manage_visibility": "प्रबंधित करें कि आपकी प्रोफ़ाइल और विवरण कौन देख सकता है।",
            "profile_visibility": "प्रोफ़ाइल दृश्यता",
            "profile_visibility_desc": "नियंत्रित करें कि आपकी पूरी प्रोफ़ाइल कौन देख सकता है।",
            "show_email": "ईमेल पता दिखाएं",
            "show_email_desc": "दूसरों को आपकी प्रोफ़ाइल पर आपका ईमेल देखने की अनुमति दें।",
            "show_phone": "फ़ोन नंबर दिखाएं",
            "show_phone_desc": "दूसरों को आपकी प्रोफ़ाइल पर आपका फ़ोन नंबर देखने की अनुमति दें।",

            // Sessions
            "manage_sessions": "अन्य उपकरणों पर लॉग इन अपने सक्रिय सत्रों को प्रबंधित करें।",
            "current_device": "वर्तमान उपकरण",

            // Landing Page Navbar & Common
            "vision": "दृष्टिकोण",
            "faq": "सामान्य प्रश्न",
            "go_back": "वापस जाएं",
            "create_account": "खाता बनाएं",
            "startups": "स्टार्टअप",
            "start_pitch": "पिच शुरू करें",
            "browse_projects": "प्रोजेक्ट ब्राउज़ करें",

            // Hero Section
            "hero_subtitle": "अगली पीढ़ी के उद्यमियों को सशक्त बनाना",
            "hero_title_1": "अपने स्टार्टअप की पिच करें,",
            "hero_title_2": "उद्यमियों के साथ जुड़ें",
            "hero_description": "अपने स्टार्टअप विचार सबमिट करें, अभिनव पिचों का पता लगाएं, और एक आकर्षक, उपयोगकर्ता के अनुकूल प्लेटफॉर्म के साथ आभासी प्रतियोगिताओं में चमकें।",
            "joined_by": "10,000+ संस्थापकों द्वारा जुड़े",
            "growth_stat": "+128% वृद्धि",
            "last_month": "पिछला महीना",

            // Startups Section
            "fresh_ideas": "क्षितिज पर",
            "horizon": "नए विचार",
            "startups_desc": "हमारे पारिस्थितिकी तंत्र में शामिल होने वाले नवीनतम उच्च-विकास वाले उद्यमों और विघटनकारी तकनीकों की खोज करें।",
            "view_all_startups": "सभी स्टार्टअप देखें",
            "sync_ecosystem": "स्टार्टअप पारिस्थितिकी तंत्र को सिंक्रनाइज़ कर रहा है...",
            "details": "विवरण",

            // Vision Section
            "vision_title": "जहाँ दृष्टि निष्पादन से मिलती है।",
            "vision_desc": "हम बुनियादी ढांचा प्रदान करते हैं ताकि आप नवाचार पर ध्यान केंद्रित कर सकें।",
            "feature_1_title": "निर्बाध नेटवर्किंग",
            "feature_1_desc": "समान विचारधारा वाले नवोन्मेषकों के साथ जुड़ें और वैश्विक स्तर पर अपने उद्यमशीलता सर्कल का विस्तार करें।",
            "feature_2_title": "स्टार्टअप्स को सशक्त बनाना",
            "feature_2_desc": "आगे आने वाले और भी बड़े अवसरों की तैयारी करते हुए अपनी यात्रा और उपलब्धियों का जश्न मनाएं।",
            "feature_3_title": "कीबोर्ड क्विक एक्शन",
            "feature_3_desc": "सहज नेविगेशन और निर्माण के लिए डिज़ाइन किए गए सहज शॉर्टकट के साथ अपनी उत्पादकता बढ़ाएं।",

            // Tools Section
            "tools_title": "आपके टूल्स के साथ निर्बाध रूप से काम करता है",
            "tools_desc": "उस स्टैक के साथ एकीकृत करें जिसे आप पहले से पसंद करते हैं।",

            // FAQ Section
            "faq_main_title": "प्रश्न? हमारे पास जवाब हैं।",
            "faq_1_q": "StartupLift को क्या अनूठा बनाता है?",
            "faq_1_a": "हम एक समुदाय-आधारित दृष्टिकोण पर ध्यान केंद्रित करते हैं, पहले दिन से मेंटरशिप को तेजी से पुनरावृत्ति और प्रतिक्रिया के लिए डिज़ाइन किए गए प्लेटफ़ॉर्म के साथ जोड़ते हैं।",
            "faq_2_q": "मैं किस तरह के एक्सपोजर की उम्मीद कर सकता हूं?",
            "faq_2_a": "आपका स्टार्टअप हमारे 10,000+ संस्थापकों, निवेशकों और शुरुआती अपनाने वालों के नेटवर्क को दिखाई देगा जो नए विचारों का परीक्षण और समर्थन करने के लिए उत्सुक हैं।",
            "faq_3_q": "क्या शामिल होने के लिए कोई शुल्क है?",
            "faq_3_a": "समुदाय में शामिल होना मुफ्त है। हम उन्नत विश्लेषण और प्रत्यक्ष निवेशक परिचय के लिए प्रीमियम स्तरों की पेशकश करते् हैं।",
            "faq_4_q": "मैं अपने प्रोजेक्ट को कैसे अपडेट करूं?",
            "faq_4_a": "आप किसी भी समय सीधे अपने डैशबोर्ड से अपने प्रोजेक्ट विवरण, मील के पत्थर और पिच डेक को अपडेट कर सकते हैं।",

            // Footer
            "footer_brand_desc": "अगली पीढ़ी के संस्थापकों को विशिष्ट मेंटरशिप, रणनीतिक फंडिंग और वैश्विक सहायता नेटवर्क के माध्यम से स्मार्ट तरीके से स्केल करने के लिए सशक्त बनाना।",
            "quick_protocols": "त्वरित प्रोटोकॉल",
            "newsletter_title": "हमारे न्यूज़लेटर से जुड़ें",
            "newsletter_desc": "क्यूरेटेड स्टार्टअप अंतर्दृष्टि और अपडेट प्राप्त करें।",
            "subscribe": "सदस्यता लें",
            "all_rights_reserved": "सर्वाधिकार सुरक्षित।",
            "privacy_policy": "गोपनीयता नीति",
            "terms_of_service": "सेवा की शर्तें"
        }
    },
    es: {
        translation: {
            // Common
            "welcome": "Bienvenido de nuevo",
            "settings": "Configuración",
            "save_changes": "Guardar Cambios",
            "search": "Buscar...",
            "loading": "Cargando...",
            "logout": "Cerrar Sesión",
            "cancel": "Cancelar",
            "delete": "Eliminar",
            "edit": "Editar",

            // Sidebar
            "overview": "Resumen",
            "profile": "Perfil",
            "programs": "Programas",
            "mentorship": "Mentoría",
            "resources": "Recursos",
            "tracker": "Seguimiento",
            "messages": "Mensajes",
            "network": "Red",
            "my_startups": "Mis Startups",
            "my_mentees": "Mis Aprendices",
            "admin_panel": "Panel de Administración",
            "user_management": "Gestión de Usuarios",
            "mentor_management": "Gestión de Mentores",
            "startup_management": "Gestión de Startups",
            "mentorship_sessions": "Sesiones de Mentoría",
            "content_management": "Gestión de Contenido",
            "reports_analytics": "Informes y Análisis",
            "platform_logs": "Registros de Plataforma",
            "mentorship_requests": "Solicitudes de Mentoría",
            "funding_requests": "Solicitudes de Financiamiento",
            "sessions_calendar": "Calendario de Sesiones",
            "tasks_feedback": "Tareas y Comentarios",
            "dashboard": "Panel",
            "home": "Inicio",
            "about": "Acerca de",
            "contact": "Contacto",
            "my_profile": "Mi Perfil",
            "main_administration": "Administración Principal",
            "system_navigator": "Navegador del Sistema",
            "startup_founder": "Fundador de Startup",
            "light_mode": "Modo Claro",
            "dark_mode": "Modo Oscuro",

            // Settings Sections
            "profile_details": "Detalles del Perfil",
            "notifications": "Notificaciones",
            "privacy": "Privacidad",
            "preferences": "Preferencias",
            "security": "Seguridad",
            "active_sessions": "Sesiones Activas",
            "platform_settings": "Configuración de Plataforma",

            // User Preferences
            "email_address": "Ingresa tu correo electrónico",
            "language": "Idioma",
            "theme": "Tema",
            "light": "Claro",
            "dark": "Oscuro",
            "system": "Sistema",
            "customize_experience": "Personaliza tu experiencia en el panel.",
            "select_appearance": "Selecciona tu apariencia preferida.",
            "select_language": "Elige tu idioma preferido.",
            "english": "Inglés",
            "hindi": "Hindi",
            "spanish": "Español",

            // Profile Form
            "full_name": "Nombre Completo",
            "phone_number": "Número de Teléfono",
            "company_startup": "Empresa / Startup",
            "linkedin_profile": "Perfil de LinkedIn",
            "bio_about": "Biografía / Acerca de",
            "job_title": "Título del Trabajo",
            "years_experience": "Años de Experiencia",
            "expertise": "Experiencia",
            "change_avatar": "Cambiar Avatar",
            "manage_profile": "Administra tu perfil público e información personal.",

            // Security
            "current_password": "Contraseña Actual",
            "new_password": "Nueva Contraseña",
            "confirm_password": "Confirmar Contraseña",
            "update_password": "Actualizar Contraseña",
            "password_protection": "Protege tu cuenta con autenticación fuerte.",

            // Notifications
            "notification_preferences": "Preferencias de Notificación",
            "choose_updates": "Elige qué actualizaciones deseas recibir.",
            "mentor_responses": "Respuestas de Mentores",
            "mentor_responses_desc": "Recibe notificaciones cuando los mentores respondan a tus solicitudes.",
            "session_reminders": "Recordatorios de Sesión",
            "session_reminders_desc": "Recibe recordatorios 1 hora antes de las sesiones programadas.",
            "platform_updates": "Actualizaciones de Plataforma",
            "platform_updates_desc": "Mantente actualizado con nuevas funciones y mejoras.",
            "marketing_emails": "Marketing y Boletín",
            "marketing_emails_desc": "Recibe consejos, tendencias e información sobre startups.",

            // Privacy
            "privacy_settings": "Configuración de Privacidad",
            "manage_visibility": "Administra quién puede ver tu perfil y detalles.",
            "profile_visibility": "Visibilidad del Perfil",
            "profile_visibility_desc": "Controla quién puede ver tu perfil completo.",
            "show_email": "Mostrar Correo Electrónico",
            "show_email_desc": "Permite que otros vean tu correo electrónico en tu perfil.",
            "show_phone": "Mostrar Número de Teléfono",
            "show_phone_desc": "Permite que otros vean tu número de teléfono en tu perfil.",

            // Sessions
            "manage_sessions": "Administra tus sesiones activas en otros dispositivos.",
            "current_device": "Dispositivo Actual",

            // Landing Page
            "vision": "Visión",
            "faq": "Preguntas Frecuentes",
            "go_back": "Regresar",
            "create_account": "Crear Cuenta",
            "startups": "Startups",
            "start_pitch": "Iniciar un Pitch",
            "browse_projects": "Explorar Proyectos",
            "hero_subtitle": "Empoderando a Emprendedores de Próxima Generación",
            "hero_title_1": "Presenta tu Startup,",
            "hero_title_2": "Conéctate Con Emprendedores",
            "hero_description": "Envía tus ideas de startups, explora presentaciones innovadoras y brilla en competencias virtuales con una plataforma elegante y fácil de usar.",
            "joined_by": "Se han unido 10,000+ fundadores",
            "growth_stat": "+128% Crecimiento",
            "last_month": "Último Mes",
            "fresh_ideas": "Ideas Frescas en el",
            "horizon": "Horizonte",
            "startups_desc": "Descubre los últimos emprendimientos de alto crecimiento y tecnologías disruptivas que se unen a nuestro ecosistema.",
            "view_all_startups": "Ver todas las startups",
            "sync_ecosystem": "Sincronizando el Ecosistema de Startups...",
            "details": "Detalles",
            "vision_title": "Donde la visión se encuentra con la ejecución.",
            "vision_desc": "Proporcionamos la infraestructura para que puedas enfocarte en la innovación.",
            "feature_1_title": "Escalado Estratégico",
            "feature_1_desc": "Lleva tu startup de MVP a una ronda Serie A con nuestros marcos de crecimiento.",
            "feature_2_title": "Próximas Competiciones",
            "feature_2_desc": "Presenta frente a inversionistas de nivel élite y gana financiamiento no dilusivo.",
            "feature_3_title": "Red Comunitaria",
            "feature_3_desc": "Conéctate con mentores y fundadores que han estado donde tú estás.",
            "tools_title": "Funciona Perfectamente con tus Herramientas",
            "tools_desc": "Intégrate con el stack que ya amas.",
            "faq_main_title": "¿Preguntas? Tenemos respuestas.",
            "faq_1_q": "¿Qué hace que StartupLift sea único?",
            "faq_1_a": "Nos enfocamos en un enfoque impulsado por la comunidad, combinando mentoría desde el primer día con una plataforma diseñada para iteración y retroalimentación rápida.",
            "faq_2_q": "¿Qué tipo de exposición puedo esperar?",
            "faq_2_a": "Tu startup será visible para nuestra red de 10,000+ fundadores, inversionistas y adoptadores tempranos que están ansiosos por probar y apoyar nuevas ideas.",
            "faq_3_q": "¿Hay una tarifa por unirse?",
            "faq_3_a": "Unirse a la comunidad es gratis. Ofrecemos niveles premium para análisis avanzado e introducciones directas a inversionistas.",
            "faq_4_q": "¿Cómo actualizo mi proyecto?",
            "faq_4_a": "Puedes actualizar los detalles de tu proyecto, hitos y mazo de pitch en cualquier momento directamente desde tu panel.",
            "footer_brand_desc": "Empoderando a la próxima generación de fundadores para escalar de manera más inteligente a través de mentoría de élite, financiamiento estratégico y una red de apoyo global.",
            "quick_protocols": "Protocolos Rápidos",
            "newsletter_title": "Únete a Nuestro Boletín",
            "newsletter_desc": "Obtén ideas y actualizaciones curadas de startups.",
            "subscribe": "Suscribirse",
            "privacy_policy": "Política de Privacidad",
            "terms_of_service": "Términos de Servicio",
            "all_rights_reserved": "Todos los derechos reservados."
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
