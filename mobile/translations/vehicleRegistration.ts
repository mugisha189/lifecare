import { SupportedLanguages } from './types';

export const vehicleRegistration = {
  // Steps
  progressText: {
    en: 'Step {{current}} of {{total}}',
    fr: 'Étape {{current}} sur {{total}}',
    rw: 'Intambwe {{current}} kuri {{total}}',
  },
  steps: {
    governmentID: {
      en: 'Government ID',
      fr: "Pièce d'identité",
      rw: 'Irangamuntu',
    },
    drivingLicense: {
      en: 'Driving License',
      fr: 'Permis de conduire',
      rw: 'Uruhushya rwo gutwara',
    },
    yelloCard: {
      en: 'Yello Card',
      fr: 'Carte Jaune',
      rw: 'Ikarita yumuhondo',
    },
    vehicleImage: {
      en: 'Vehicle Image',
      fr: 'Photo du véhicule',
      rw: 'Ifoto yimodoka',
    },
    vehicleInformation: {
      en: 'Vehicle Information',
      fr: 'Informations du véhicule',
      rw: 'Amakuru yimodoka',
    },
    review: {
      en: 'Review your information',
      fr: 'Vérifiez vos informations',
      rw: 'Suzuma amakuru yawe',
    },
    success: {
      en: 'Vehicle registered',
      fr: 'Véhicule enregistré',
      rw: 'Imodoka yanditswe',
    },
  },

  // Document Upload
  documentUpload: {
    requirements: {
      noPhotocopies: {
        en: 'Photocopies and printouts of document will not be accepted',
        fr: 'Les photocopies et impressions de documents ne seront pas acceptées',
        rw: "Fotokopi n'amashusho yacapwe ntizemewe",
      },
      clearDetails: {
        en: 'The photo and all details must be clearly visible',
        fr: 'La photo et tous les détails doivent être clairement visibles',
        rw: "Ifoto n'amakuru yose bigomba kugaragara neza",
      },
      fileFormat: {
        en: 'Only documents that are less than 10 MB in size and JPG, JPEG, PNG, or PDF format will be accepted.',
        fr: 'Seuls les documents de moins de 10 Mo et au format JPG, JPEG, PNG ou PDF seront acceptés.',
        rw: 'Inyandiko munsi ya MB 10 kandi ziri mu buryo bwa JPG, JPEG, PNG, cyangwa PDF gusa nizemewe.',
      },
    },
    labels: {
      governmentID: {
        en: 'Government ID Document',
        fr: "Document d'identité",
        rw: "Icyangombwa cy'irangamuntu",
      },
      drivingLicense: {
        en: 'Driving License Document',
        fr: 'Document de permis de conduire',
        rw: "Icyangombwa cy'uruhushya rwo gutwara",
      },
      yelloCard: {
        en: 'Yello Card Document',
        fr: 'Document de carte jaune',
        rw: "Icyangombwa cy'ikarita yumuhondo",
      },
      vehicleImage: {
        en: 'Vehicle Photo',
        fr: 'Photo du véhicule',
        rw: 'Ifoto yimodoka',
      },
    },
    uploadDocument: {
      en: 'Upload Document',
      fr: 'Télécharger le document',
      rw: 'Ohereza icyangombwa',
    },
    uploadHint: {
      en: 'Tap to select from gallery or browse files',
      fr: 'Appuyez pour sélectionner depuis la galerie ou parcourir les fichiers',
      rw: 'Kanda kugirango uhitemo muri galeri cyangwa ushakishe dosiye',
    },
    selectOption: {
      en: 'Choose an upload method',
      fr: 'Choisissez une méthode de téléchargement',
      rw: 'Hitamo uburyo bwo kohereza',
    },
    chooseGallery: {
      en: 'Choose from Gallery',
      fr: 'Choisir dans la galerie',
      rw: 'Hitamo muri galeri',
    },
    chooseGalleryHint: {
      en: 'Pick an image from your photos',
      fr: 'Sélectionner une image de vos photos',
      rw: 'Hitamo ishusho mu mafoto yawe',
    },
    browseFiles: {
      en: 'Browse Files',
      fr: 'Parcourir les fichiers',
      rw: 'Shakisha dosiye',
    },
    browseFilesHint: {
      en: 'Select PDF or image file',
      fr: 'Sélectionner un fichier PDF ou image',
      rw: 'Hitamo dosiye ya PDF cyangwa ishusho',
    },
    permissionRequired: {
      en: 'Permission Required',
      fr: 'Permission requise',
      rw: 'Uruhushya rurakenewe',
    },
    permissionMessage: {
      en: 'Permission to access camera roll is required!',
      fr: "L'autorisation d'accéder à la galerie photo est requise!",
      rw: 'Uruhushya rwo kubona amafoto rurakenewe!',
    },
    uploaded: {
      en: '100% uploaded',
      fr: '100% téléchargé',
      rw: '100% byoherejwe',
    },
    continueHint: {
      en: "Click continue if you think this image it's readable or tap on re-upload button to upload another one",
      fr: 'Cliquez sur continuer si vous pensez que cette image est lisible ou appuyez sur le bouton re-télécharger pour en télécharger une autre',
      rw: 'Kanda komeza niba utekereza ko iyi shusho isomeka cyangwa kanda buto yo kongera kohereza kugirango ukoresheje iyindi',
    },
    reupload: {
      en: 'Re-upload',
      fr: 'Re-télécharger',
      rw: 'Ongera ukohereje',
    },
    continue: {
      en: 'Continue',
      fr: 'Continuer',
      rw: 'Komeza',
    },
    back: {
      en: 'Back',
      fr: 'Retour',
      rw: 'Subira inyuma',
    },
  },

  // Vehicle Information Form
  vehicleInfo: {
    subtitle: {
      en: 'Please provide accurate information about your vehicle.',
      fr: 'Veuillez fournir des informations précises sur votre véhicule.',
      rw: 'Nyamuneka tanga amakuru nyayo ku modoka yawe.',
    },
    make: {
      en: 'Vehicle Make',
      fr: 'Marque du véhicule',
      rw: 'Ubwoko bwimodoka',
    },
    capacity: {
      en: 'Vehicle capacity',
      fr: 'Capacité du véhicule',
      rw: 'Ubushobozi bwimodoka',
    },
    year: {
      en: 'Vehicle Year',
      fr: 'Année du véhicule',
      rw: 'Umwaka wimodoka',
    },
    color: {
      en: 'Vehicle Color',
      fr: 'Couleur du véhicule',
      rw: 'Ibara ryimodoka',
    },
    category: {
      en: 'Vehicle Category',
      fr: 'Catégorie du véhicule',
      rw: 'Icyiciro cyimodoka',
    },
    plateNumber: {
      en: 'Plate Number',
      fr: 'Numéro de plaque',
      rw: 'Numero ya plaki',
    },
    plateNumberPlaceholder: {
      en: 'RAD 123 B',
      fr: 'RAD 123 B',
      rw: 'RAD 123 B',
    },
    continue: {
      en: 'Continue',
      fr: 'Continuer',
      rw: 'Komeza',
    },
  },

  // Review Step
  review: {
    question: {
      en: 'Is the information you have submitted correct?',
      fr: 'Les informations que vous avez soumises sont-elles correctes?',
      rw: 'Amakuru wohereje ari yo nyayo?',
    },
    documents: {
      en: 'Documents',
      fr: 'Documents',
      rw: 'Inyandiko',
    },
    edit: {
      en: 'Edit',
      fr: 'Modifier',
      rw: 'Hindura',
    },
    nationalID: {
      en: 'National ID',
      fr: "Carte d'identité nationale",
      rw: 'Irangamuntu',
    },
    drivingLicense: {
      en: 'Upload Driving License',
      fr: 'Télécharger le permis de conduire',
      rw: 'Ohereza uruhushya rwo gutwara',
    },
    vehicleImage: {
      en: 'Vehicle Image',
      fr: 'Photo du véhicule',
      rw: 'Ifoto yimodoka',
    },
    vehicleInformation: {
      en: 'Vehicle Information',
      fr: 'Informations du véhicule',
      rw: 'Amakuru yimodoka',
    },
    plateNumber: {
      en: 'Plate Number',
      fr: 'Numéro de plaque',
      rw: 'Numero ya plaki',
    },
    vehicleCategory: {
      en: 'Vehicle Category',
      fr: 'Catégorie du véhicule',
      rw: 'Icyiciro cyimodoka',
    },
    vehicleMake: {
      en: 'Vehicle Make',
      fr: 'Marque du véhicule',
      rw: 'Ubwoko bwimodoka',
    },
    vehicleCapacity: {
      en: 'Vehicle Capacity',
      fr: 'Capacité du véhicule',
      rw: 'Ubushobozi bwimodoka',
    },
    vehicleColor: {
      en: 'Vehicle Color',
      fr: 'Couleur du véhicule',
      rw: 'Ibara ryimodoka',
    },
    warningMessage: {
      en: "Don't worry, your vehicle category is currently set to {{category}} by default. This will be reviewed and updated after we verify your documents",
      fr: 'Ne vous inquiétez pas, la catégorie de votre véhicule est actuellement définie sur {{category}} par défaut. Cela sera examiné et mis à jour après vérification de vos documents',
      rw: 'Ntugire ubwoba, icyiciro cyimodoka yawe kiriho {{category}} ku buryo busanzwe. Bizasubirwamo kandi bikavugururwa nyuma yo kwemeza inyandiko zawe',
    },
    submit: {
      en: 'Submit',
      fr: 'Soumettre',
      rw: 'Ohereza',
    },
  },

  // Success Step
  success: {
    title: {
      en: 'Vehicle registered',
      fr: 'Véhicule enregistré',
      rw: 'Imodoka yanditswe',
    },
    message: {
      en: 'Your application has been submitted and is currently under review.',
      fr: "Votre demande a été soumise et est actuellement en cours d'examen.",
      rw: 'Icyifuzo cyawe cyoherejwe kandi kiri mu kwisuzumisha.',
    },
    additionalInfo: {
      en: 'You will be notified with application status or check the status by going to setting',
      fr: 'Vous serez informé du statut de la demande ou vous pouvez vérifier le statut dans les paramètres',
      rw: 'Uzabimenyeshwa icyifuzo cyawe kimeze gute cyangwa urebe uko bimeze ugiye mu mahitamo',
    },
    exploreApp: {
      en: 'Explore app',
      fr: "Explorer l'application",
      rw: 'Reba porogaramu',
    },
  },

  // Validation Errors
  errors: {
    makeRequired: {
      en: 'Vehicle make is required',
      fr: 'La marque du véhicule est requise',
      rw: 'Ubwoko bwimodoka burakenewe',
    },
    capacityRequired: {
      en: 'Vehicle capacity is required',
      fr: 'La capacité du véhicule est requise',
      rw: 'Ubushobozi bwimodoka burakenewe',
    },
    yearRequired: {
      en: 'Vehicle year is required',
      fr: "L'année du véhicule est requise",
      rw: 'Umwaka wimodoka urakenewe',
    },
    colorRequired: {
      en: 'Vehicle color is required',
      fr: 'La couleur du véhicule est requise',
      rw: 'Ibara ryimodoka rirakenewe',
    },
    categoryRequired: {
      en: 'Vehicle category is required',
      fr: 'La catégorie du véhicule est requise',
      rw: 'Icyiciro cyimodoka kirakenewe',
    },
    plateNumberRequired: {
      en: 'Plate number is required',
      fr: 'Le numéro de plaque est requis',
      rw: 'Numero ya plaki irakenewe',
    },
  },

  // Toast Messages
  toast: {
    submitSuccess: {
      en: 'Vehicle registration submitted successfully!',
      fr: 'Enregistrement du véhicule soumis avec succès!',
      rw: 'Iyandikisha ryimodoka ryoherejwe neza!',
    },
    submitError: {
      en: 'Failed to submit registration. Please try again.',
      fr: "Échec de la soumission de l'enregistrement. Veuillez réessayer.",
      rw: 'Kwohereza byanze. Nyamuneka ongera ugerageze.',
    },
  },
};
