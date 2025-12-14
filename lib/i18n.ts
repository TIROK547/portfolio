export type Locale = 'en' | 'fa';

export const locales: Locale[] = ['en', 'fa'];

export const defaultLocale: Locale = 'en';

interface Translations {
  nav: {
    home: string;
    about: string;
    projects: string;
    contact: string;
  };
  home: {
    welcome: string;
    role: string;
    viewMore: string;
  };
  about: {
    title: string;
    bio: string;
    age: string;
    location: string;
  };
  projects: {
    title: string;
    viewGithub: string;
    stack: string;
  };
  contact: {
    title: string;
    email: string;
    telegram: string;
    github: string;
    linkedin: string;
  };
  stack: {
    title: string;
    frontend: string;
    backend: string;
    devops: string;
    extras: string;
  };
  hero: {
    name: string;
    alias: string;
    role: string;
    uptime: string;
    shell: string;
    languages: string;
    user: string;
    location: string;
    age: string;
    stack: string;
  };
  footer: {
    text: string;
  };
}

const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      home: 'home',
      about: 'about',
      projects: 'projects',
      contact: 'contact',
    },
    home: {
      welcome: 'Welcome to my terminal',
      role: 'Junior Full Stack Web Developer',
      viewMore: 'view more',
    },
    about: {
      title: 'about_me',
      bio: `I'm Alireza Ghotbi, a 19-year-old full-stack developer from Iran. I build web applications with a focus on clean architecture and modern technologies. My journey in programming started with curiosity and evolved into a passion for creating efficient, scalable solutions.

I specialize in backend development with Django and frontend with Next.js, but I enjoy working across the entire stack. When I'm not coding, I'm probably exploring new technologies or optimizing my Arch Linux setup.`,
      age: '19',
      location: 'Iran',
    },
    projects: {
      title: 'projects',
      viewGithub: 'view on github',
      stack: 'stack',
    },
    contact: {
      title: 'contact',
      email: 'email',
      telegram: 'telegram',
      github: 'github',
      linkedin: 'linkedin',
    },
    stack: {
      title: 'stack_overview',
      frontend: 'frontend',
      backend: 'backend',
      devops: 'devops',
      extras: 'extras',
    },
    hero: {
      name: 'name',
      alias: 'alias',
      role: 'role',
      uptime: 'uptime',
      shell: 'shell',
      languages: 'languages',
      user: 'user',
      location: 'location',
      age: 'age',
      stack: 'stack',
    },
    footer: {
      text: 'system status: online | last updated: 2025',
    },
  },
  fa: {
    nav: {
      home: 'خانه',
      about: 'درباره',
      projects: 'پروژه\u200cها',
      contact: 'تماس',
    },
    home: {
      welcome: 'به ترمینال من خوش آمدید',
      role: 'توسعه\u200cدهنده فول\u200cاستک جونیور',
      viewMore: 'مشاهده بیشتر',
    },
    about: {
      title: 'درباره_من',
      bio: `من علیرضا قطبی هستم، یک توسعه\u200cدهنده فول\u200cاستک 19 ساله از ایران. من برنامه\u200cهای وب با تمرکز بر معماری تمیز و تکنولوژی\u200cهای مدرن می\u200cسازم. سفر من در برنامه\u200cنویسی با کنجکاوی شروع شد و به عشق به ایجاد راه\u200cحل\u200cهای کارآمد و مقیاس\u200cپذیر تبدیل شد.

من در توسعه بک\u200cاند با Django و فرانت\u200cاند با Next.js تخصص دارم، اما از کار کردن در تمام استک لذت می\u200cبرم. وقتی کد نمی\u200cزنم، احتمالاً در حال کاوش تکنولوژی\u200cهای جدید یا بهینه\u200cسازی تنظیمات Arch Linux خود هستم.`,
      age: '۱۹',
      location: 'ایران',
    },
    projects: {
      title: 'پروژه\u200cها',
      viewGithub: 'مشاهده در گیت\u200cهاب',
      stack: 'استک',
    },
    contact: {
      title: 'تماس',
      email: 'ایمیل',
      telegram: 'تلگرام',
      github: 'گیت\u200cهاب',
      linkedin: 'لینکدین',
    },
    stack: {
      title: 'نمای_کلی_استک',
      frontend: 'فرانت\u200cاند',
      backend: 'بک\u200cاند',
      devops: 'دواپس',
      extras: 'موارد_اضافی',
    },
    hero: {
      name: 'نام',
      alias: 'نام_مستعار',
      role: 'نقش',
      uptime: 'مدت_فعالیت',
      shell: 'شل',
      languages: 'زبان\u200cها',
      user: 'کاربر',
      location: 'موقعیت',
      age: 'سن',
      stack: 'استک',
    },
    footer: {
      text: 'وضعیت سیستم: آنلاین | آخرین به\u200cروزرسانی: ۱۴۰۴',
    },
  },
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[defaultLocale];
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
