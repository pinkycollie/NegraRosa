// translations.ts
// This file contains multilingual text for verification instructions

export type SupportedLanguage = 
  | 'en' | 'es' | 'fr' | 'zh' | 'ar' | 'hi' | 'ru' | 'pt' | 'ja' | 'bn' | 'sw' | 'ko';

export interface VerificationTranslations {
  // Common elements
  common: {
    continue: string;
    cancel: string;
    back: string;
    submit: string;
    error: string;
    success: string;
    loading: string;
    retry: string;
    or: string;
    help: string;
    optional: string;
    required: string;
  };
  
  // Verification types
  verificationTypes: {
    phone: string;
    email: string;
    document: string;
    video: string;
    inPerson: string;
    biometric: string;
    community: string;
  };
  
  // Phone verification
  phoneVerification: {
    title: string;
    description: string;
    phoneNumberLabel: string;
    phoneNumberPlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
    sendCode: string;
    verifyCode: string;
    resendCode: string;
    phoneTypes: {
      standard: string;
      prepaid: string;
      international: string;
      deaf: string;
    };
    methods: {
      voice: string;
      text: string;
      video: string;
      email: string;
    };
    fccMarker: {
      title: string;
      description: string;
      toggle: string;
      explainer: string;
    };
    explanation: {
      title: string;
      description: string;
      placeholder: string;
    };
    alternative: {
      title: string;
      description: string;
    };
    success: {
      title: string;
      description: string;
    };
    errors: {
      invalidPhone: string;
      invalidCode: string;
      tooManyAttempts: string;
      serviceUnavailable: string;
    };
  };
  
  // Video verification
  videoVerification: {
    title: string;
    description: string;
    preparingVideo: string;
    signLanguageSelect: string;
    privacyNote: string;
    startVideo: string;
    cancelVideo: string;
  };
  
  // Accessibility statements
  accessibility: {
    title: string;
    needHelp: string;
    contactSupport: string;
    alternativeMethods: string;
  };
}

// English translations (base language)
export const en: VerificationTranslations = {
  common: {
    continue: "Continue",
    cancel: "Cancel",
    back: "Back",
    submit: "Submit",
    error: "Error",
    success: "Success",
    loading: "Loading...",
    retry: "Retry",
    or: "or",
    help: "Help",
    optional: "optional",
    required: "required",
  },
  verificationTypes: {
    phone: "Phone Verification",
    email: "Email Verification",
    document: "Document Verification",
    video: "Video Verification",
    inPerson: "In-Person Verification",
    biometric: "Biometric Verification",
    community: "Community Verification",
  },
  phoneVerification: {
    title: "Inclusive Phone Verification",
    description: "Verify your phone through multiple methods, designed for all accessibility needs",
    phoneNumberLabel: "Phone Number",
    phoneNumberPlaceholder: "+1 (555) 123-4567",
    codeLabel: "Verification Code",
    codePlaceholder: "Enter the code we sent you",
    sendCode: "Send Verification",
    verifyCode: "Verify Code",
    resendCode: "Resend Code",
    phoneTypes: {
      standard: "Standard Plan",
      prepaid: "Prepaid",
      international: "International",
      deaf: "Deaf Plan",
    },
    methods: {
      voice: "Voice Call",
      text: "Text Message",
      video: "Video Verification",
      email: "Email Link",
    },
    fccMarker: {
      title: "Deaf Plan Selected",
      description: "We'll adapt our verification process to accommodate your needs",
      toggle: "Add FCC marker to your phone number",
      explainer: "This helps companies identify you as a deaf caller, not a robocall, and routes you through accessible verification methods",
    },
    explanation: {
      title: "Explain your situation (optional)",
      description: "Providing context helps us verify your identity more effectively. Your explanation is reviewed by our AI and can improve your verification experience.",
      placeholder: "Explain why you're using this type of phone plan, or any challenges you face with traditional verification...",
    },
    alternative: {
      title: "Alternative",
      description: "Choose an alternative verification method if you're having trouble with phone verification",
    },
    success: {
      title: "Verification Complete",
      description: "Your phone number has been successfully verified.",
    },
    errors: {
      invalidPhone: "Please enter a valid phone number",
      invalidCode: "The verification code you entered is invalid",
      tooManyAttempts: "Too many attempts. Please try again later",
      serviceUnavailable: "Service is currently unavailable. Please try again later",
    },
  },
  videoVerification: {
    title: "Sign Language Video Verification",
    description: "Verify your identity using sign language with one of our interpreters",
    preparingVideo: "Preparing video connection...",
    signLanguageSelect: "Select preferred sign language:",
    privacyNote: "For privacy and security, this video call is not recorded. Our interpreters are bound by confidentiality agreements.",
    startVideo: "Start Verification",
    cancelVideo: "Cancel",
  },
  accessibility: {
    title: "Verification Access Statement",
    needHelp: "Need Help?",
    contactSupport: "Contact Inclusive Verification Team",
    alternativeMethods: "We believe verification should never exclude people due to disabilities, economic circumstances, or international status. If none of these methods work for you, please contact our inclusive verification team for personalized assistance.",
  },
};

// Spanish translations
export const es: VerificationTranslations = {
  common: {
    continue: "Continuar",
    cancel: "Cancelar",
    back: "Atrás",
    submit: "Enviar",
    error: "Error",
    success: "Éxito",
    loading: "Cargando...",
    retry: "Reintentar",
    or: "o",
    help: "Ayuda",
    optional: "opcional",
    required: "requerido",
  },
  verificationTypes: {
    phone: "Verificación Telefónica",
    email: "Verificación por Correo Electrónico",
    document: "Verificación de Documentos",
    video: "Verificación por Video",
    inPerson: "Verificación en Persona",
    biometric: "Verificación Biométrica",
    community: "Verificación Comunitaria",
  },
  phoneVerification: {
    title: "Verificación Telefónica Inclusiva",
    description: "Verifica tu teléfono a través de múltiples métodos, diseñado para todas las necesidades de accesibilidad",
    phoneNumberLabel: "Número de Teléfono",
    phoneNumberPlaceholder: "+34 (555) 123-456",
    codeLabel: "Código de Verificación",
    codePlaceholder: "Ingresa el código que te enviamos",
    sendCode: "Enviar Verificación",
    verifyCode: "Verificar Código",
    resendCode: "Reenviar Código",
    phoneTypes: {
      standard: "Plan Estándar",
      prepaid: "Prepago",
      international: "Internacional",
      deaf: "Plan para Sordos",
    },
    methods: {
      voice: "Llamada de Voz",
      text: "Mensaje de Texto",
      video: "Verificación por Video",
      email: "Enlace por Correo",
    },
    fccMarker: {
      title: "Plan para Sordos Seleccionado",
      description: "Adaptaremos nuestro proceso de verificación para satisfacer tus necesidades",
      toggle: "Agregar marcador FCC a tu número de teléfono",
      explainer: "Esto ayuda a las empresas a identificarte como un usuario sordo, no como una llamada automática, y te dirige a métodos de verificación accesibles",
    },
    explanation: {
      title: "Explica tu situación (opcional)",
      description: "Proporcionar contexto nos ayuda a verificar tu identidad de manera más efectiva. Tu explicación es revisada por nuestra IA y puede mejorar tu experiencia de verificación.",
      placeholder: "Explica por qué estás usando este tipo de plan telefónico o los desafíos que enfrentas con la verificación tradicional...",
    },
    alternative: {
      title: "Alternativa",
      description: "Elige un método de verificación alternativo si tienes problemas con la verificación telefónica",
    },
    success: {
      title: "Verificación Completada",
      description: "Tu número de teléfono ha sido verificado exitosamente.",
    },
    errors: {
      invalidPhone: "Por favor, ingresa un número de teléfono válido",
      invalidCode: "El código de verificación que ingresaste no es válido",
      tooManyAttempts: "Demasiados intentos. Por favor, inténtalo más tarde",
      serviceUnavailable: "El servicio no está disponible actualmente. Por favor, inténtalo más tarde",
    },
  },
  videoVerification: {
    title: "Verificación por Video en Lenguaje de Señas",
    description: "Verifica tu identidad utilizando lenguaje de señas con uno de nuestros intérpretes",
    preparingVideo: "Preparando conexión de video...",
    signLanguageSelect: "Selecciona el lenguaje de señas preferido:",
    privacyNote: "Por privacidad y seguridad, esta videollamada no se graba. Nuestros intérpretes están obligados por acuerdos de confidencialidad.",
    startVideo: "Iniciar Verificación",
    cancelVideo: "Cancelar",
  },
  accessibility: {
    title: "Declaración de Acceso a la Verificación",
    needHelp: "¿Necesitas Ayuda?",
    contactSupport: "Contactar al Equipo de Verificación Inclusiva",
    alternativeMethods: "Creemos que la verificación nunca debe excluir a las personas debido a discapacidades, circunstancias económicas o estatus internacional. Si ninguno de estos métodos funciona para ti, comunícate con nuestro equipo de verificación inclusiva para recibir asistencia personalizada.",
  },
};

// French translations
export const fr: VerificationTranslations = {
  common: {
    continue: "Continuer",
    cancel: "Annuler",
    back: "Retour",
    submit: "Soumettre",
    error: "Erreur",
    success: "Succès",
    loading: "Chargement...",
    retry: "Réessayer",
    or: "ou",
    help: "Aide",
    optional: "optionnel",
    required: "requis",
  },
  verificationTypes: {
    phone: "Vérification par Téléphone",
    email: "Vérification par Email",
    document: "Vérification de Documents",
    video: "Vérification par Vidéo",
    inPerson: "Vérification en Personne",
    biometric: "Vérification Biométrique",
    community: "Vérification Communautaire",
  },
  phoneVerification: {
    title: "Vérification Téléphonique Inclusive",
    description: "Vérifiez votre téléphone par plusieurs méthodes, conçu pour tous les besoins d'accessibilité",
    phoneNumberLabel: "Numéro de Téléphone",
    phoneNumberPlaceholder: "+33 (0)6 12 34 56 78",
    codeLabel: "Code de Vérification",
    codePlaceholder: "Entrez le code que nous vous avons envoyé",
    sendCode: "Envoyer la Vérification",
    verifyCode: "Vérifier le Code",
    resendCode: "Renvoyer le Code",
    phoneTypes: {
      standard: "Plan Standard",
      prepaid: "Prépayé",
      international: "International",
      deaf: "Plan pour Malentendants",
    },
    methods: {
      voice: "Appel Vocal",
      text: "Message Texte",
      video: "Vérification par Vidéo",
      email: "Lien par Email",
    },
    fccMarker: {
      title: "Plan pour Malentendants Sélectionné",
      description: "Nous adapterons notre processus de vérification pour répondre à vos besoins",
      toggle: "Ajouter un marqueur FCC à votre numéro de téléphone",
      explainer: "Cela aide les entreprises à vous identifier en tant qu'appelant malentendant, pas comme un appel automatisé, et vous dirige vers des méthodes de vérification accessibles",
    },
    explanation: {
      title: "Expliquez votre situation (optionnel)",
      description: "Fournir un contexte nous aide à vérifier votre identité plus efficacement. Votre explication est examinée par notre IA et peut améliorer votre expérience de vérification.",
      placeholder: "Expliquez pourquoi vous utilisez ce type de forfait téléphonique, ou les défis que vous rencontrez avec la vérification traditionnelle...",
    },
    alternative: {
      title: "Alternative",
      description: "Choisissez une méthode de vérification alternative si vous avez des difficultés avec la vérification téléphonique",
    },
    success: {
      title: "Vérification Terminée",
      description: "Votre numéro de téléphone a été vérifié avec succès.",
    },
    errors: {
      invalidPhone: "Veuillez entrer un numéro de téléphone valide",
      invalidCode: "Le code de vérification que vous avez entré n'est pas valide",
      tooManyAttempts: "Trop de tentatives. Veuillez réessayer plus tard",
      serviceUnavailable: "Le service est actuellement indisponible. Veuillez réessayer plus tard",
    },
  },
  videoVerification: {
    title: "Vérification Vidéo en Langue des Signes",
    description: "Vérifiez votre identité en utilisant la langue des signes avec l'un de nos interprètes",
    preparingVideo: "Préparation de la connexion vidéo...",
    signLanguageSelect: "Sélectionnez la langue des signes préférée:",
    privacyNote: "Pour des raisons de confidentialité et de sécurité, cet appel vidéo n'est pas enregistré. Nos interprètes sont liés par des accords de confidentialité.",
    startVideo: "Démarrer la Vérification",
    cancelVideo: "Annuler",
  },
  accessibility: {
    title: "Déclaration d'Accès à la Vérification",
    needHelp: "Besoin d'Aide?",
    contactSupport: "Contacter l'Équipe de Vérification Inclusive",
    alternativeMethods: "Nous croyons que la vérification ne devrait jamais exclure les personnes en raison de handicaps, de circonstances économiques ou de statut international. Si aucune de ces méthodes ne fonctionne pour vous, veuillez contacter notre équipe de vérification inclusive pour une assistance personnalisée.",
  },
};

// Mandarin Chinese translations
export const zh: VerificationTranslations = {
  common: {
    continue: "继续",
    cancel: "取消",
    back: "返回",
    submit: "提交",
    error: "错误",
    success: "成功",
    loading: "加载中...",
    retry: "重试",
    or: "或",
    help: "帮助",
    optional: "可选",
    required: "必填",
  },
  verificationTypes: {
    phone: "电话验证",
    email: "电子邮件验证",
    document: "文件验证",
    video: "视频验证",
    inPerson: "亲自验证",
    biometric: "生物识别验证",
    community: "社区验证",
  },
  phoneVerification: {
    title: "包容性电话验证",
    description: "通过多种方法验证您的电话，适合所有无障碍需求",
    phoneNumberLabel: "电话号码",
    phoneNumberPlaceholder: "+86 138 1234 5678",
    codeLabel: "验证码",
    codePlaceholder: "输入我们发送给您的验证码",
    sendCode: "发送验证",
    verifyCode: "验证代码",
    resendCode: "重新发送验证码",
    phoneTypes: {
      standard: "标准套餐",
      prepaid: "预付费",
      international: "国际",
      deaf: "聋人套餐",
    },
    methods: {
      voice: "语音通话",
      text: "短信",
      video: "视频验证",
      email: "电子邮件链接",
    },
    fccMarker: {
      title: "已选择聋人套餐",
      description: "我们将调整验证流程以满足您的需求",
      toggle: "为您的电话号码添加FCC标记",
      explainer: "这有助于公司将您识别为聋人来电者，而非自动电话，并将您引导至无障碍验证方法",
    },
    explanation: {
      title: "解释您的情况（可选）",
      description: "提供背景信息有助于我们更有效地验证您的身份。您的解释将由我们的AI审核，并可能改善您的验证体验。",
      placeholder: "解释为什么您使用这种类型的电话套餐，或者您在传统验证中面临的挑战...",
    },
    alternative: {
      title: "替代方案",
      description: "如果您在电话验证中遇到问题，请选择替代验证方法",
    },
    success: {
      title: "验证完成",
      description: "您的电话号码已成功验证。",
    },
    errors: {
      invalidPhone: "请输入有效的电话号码",
      invalidCode: "您输入的验证码无效",
      tooManyAttempts: "尝试次数过多。请稍后再试",
      serviceUnavailable: "服务当前不可用。请稍后再试",
    },
  },
  videoVerification: {
    title: "手语视频验证",
    description: "通过手语与我们的翻译人员验证您的身份",
    preparingVideo: "正在准备视频连接...",
    signLanguageSelect: "选择首选手语:",
    privacyNote: "出于隐私和安全考虑，此视频通话不会被录制。我们的翻译人员受保密协议约束。",
    startVideo: "开始验证",
    cancelVideo: "取消",
  },
  accessibility: {
    title: "验证无障碍声明",
    needHelp: "需要帮助？",
    contactSupport: "联系包容性验证团队",
    alternativeMethods: "我们相信验证绝不应因残疾、经济状况或国际身份而排除任何人。如果这些方法都不适合您，请联系我们的包容性验证团队获取个性化帮助。",
  },
};

// Arabic translations
export const ar: VerificationTranslations = {
  common: {
    continue: "متابعة",
    cancel: "إلغاء",
    back: "رجوع",
    submit: "إرسال",
    error: "خطأ",
    success: "نجاح",
    loading: "جاري التحميل...",
    retry: "إعادة المحاولة",
    or: "أو",
    help: "مساعدة",
    optional: "اختياري",
    required: "مطلوب",
  },
  verificationTypes: {
    phone: "تحقق عبر الهاتف",
    email: "تحقق عبر البريد الإلكتروني",
    document: "تحقق من المستندات",
    video: "تحقق بالفيديو",
    inPerson: "تحقق شخصي",
    biometric: "تحقق بيومتري",
    community: "تحقق مجتمعي",
  },
  phoneVerification: {
    title: "تحقق شامل عبر الهاتف",
    description: "تحقق من هاتفك عبر طرق متعددة، مصممة لجميع احتياجات إمكانية الوصول",
    phoneNumberLabel: "رقم الهاتف",
    phoneNumberPlaceholder: "+966 5X XXX XXXX",
    codeLabel: "رمز التحقق",
    codePlaceholder: "أدخل الرمز الذي أرسلناه إليك",
    sendCode: "إرسال التحقق",
    verifyCode: "التحقق من الرمز",
    resendCode: "إعادة إرسال الرمز",
    phoneTypes: {
      standard: "خطة قياسية",
      prepaid: "مسبق الدفع",
      international: "دولي",
      deaf: "خطة للصم",
    },
    methods: {
      voice: "مكالمة صوتية",
      text: "رسالة نصية",
      video: "تحقق بالفيديو",
      email: "رابط بريد إلكتروني",
    },
    fccMarker: {
      title: "تم اختيار خطة الصم",
      description: "سنقوم بتكييف عملية التحقق لتلبية احتياجاتك",
      toggle: "إضافة علامة FCC لرقم هاتفك",
      explainer: "يساعد هذا الشركات على تحديدك كمتصل أصم، وليس كمكالمة آلية، ويوجهك إلى طرق تحقق ميسرة",
    },
    explanation: {
      title: "اشرح وضعك (اختياري)",
      description: "تقديم السياق يساعدنا على التحقق من هويتك بشكل أكثر فعالية. تتم مراجعة شرحك بواسطة الذكاء الاصطناعي ويمكن أن يحسن تجربة التحقق الخاصة بك.",
      placeholder: "اشرح لماذا تستخدم هذا النوع من خطة الهاتف، أو التحديات التي تواجهها مع التحقق التقليدي...",
    },
    alternative: {
      title: "بديل",
      description: "اختر طريقة تحقق بديلة إذا كنت تواجه مشكلة في التحقق عبر الهاتف",
    },
    success: {
      title: "اكتمل التحقق",
      description: "تم التحقق من رقم هاتفك بنجاح.",
    },
    errors: {
      invalidPhone: "الرجاء إدخال رقم هاتف صالح",
      invalidCode: "رمز التحقق الذي أدخلته غير صالح",
      tooManyAttempts: "محاولات كثيرة جدًا. الرجاء المحاولة لاحقًا",
      serviceUnavailable: "الخدمة غير متوفرة حاليًا. الرجاء المحاولة لاحقًا",
    },
  },
  videoVerification: {
    title: "تحقق بالفيديو بلغة الإشارة",
    description: "تحقق من هويتك باستخدام لغة الإشارة مع أحد مترجمينا",
    preparingVideo: "جاري تحضير اتصال الفيديو...",
    signLanguageSelect: "اختر لغة الإشارة المفضلة:",
    privacyNote: "للخصوصية والأمان، لا يتم تسجيل هذه المكالمة المرئية. مترجمونا ملزمون باتفاقيات السرية.",
    startVideo: "بدء التحقق",
    cancelVideo: "إلغاء",
  },
  accessibility: {
    title: "بيان الوصول إلى التحقق",
    needHelp: "بحاجة إلى مساعدة؟",
    contactSupport: "اتصل بفريق التحقق الشامل",
    alternativeMethods: "نحن نؤمن بأن التحقق يجب ألا يستبعد أبدًا الأشخاص بسبب الإعاقة أو الظروف الاقتصادية أو الوضع الدولي. إذا لم تنجح أي من هذه الطرق معك، يرجى الاتصال بفريق التحقق الشامل للحصول على مساعدة مخصصة.",
  },
};

// All available translations
export const translations: Record<SupportedLanguage, VerificationTranslations> = {
  en,
  es,
  fr,
  zh,
  ar,
  hi: en, // Placeholder - would need proper Hindi translations
  ru: en, // Placeholder - would need proper Russian translations
  pt: en, // Placeholder - would need proper Portuguese translations
  ja: en, // Placeholder - would need proper Japanese translations
  bn: en, // Placeholder - would need proper Bengali translations
  sw: en, // Placeholder - would need proper Swahili translations
  ko: en, // Placeholder - would need proper Korean translations
};

// Default language
export const defaultLanguage: SupportedLanguage = 'en';