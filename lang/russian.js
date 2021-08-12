var lang = {};

    lang.ext = 'ru'
    lang.date_short = [ 'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря' ]
    lang.date_full = [ 'Янв', 'Фев', 'Мар', 'Апр', 'Мая', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ]
    lang.date_time_v = " в "

    lang.bell = {
        alert : {
            default : 'Системная ошибка',
            success : 'OK',
            error : 'Ошибка'
        },
        confirm : {
            buttons : ['Ок','Отмена'],
            header: 'Подтверждение'
        }
    }

    lang.nav = {
        mining : 'Манинг',
        accounts : 'Аккаунты',
        groups : 'Группы',
        settings : 'Настройки',
        information : 'Информация'
    }

    lang.buffer = {
        header: 'Буффер обмена',
        message: 'Текст успешно скопирован'
    }

    lang.mining_status = {
        WAITING: 'Ожидает запуска',
        COMPLETED: 'Готов к запуску',
        GET_TOKEN_PROCESS: 'Процесс получения токена сессии',
        GET_TOKEN_SUCCESS : 'Токен сессии получен',
        GET_TOKEN_ERROR : 'Токен сессии получить не удалось',
        START_MININNG : 'Запуск средств майнинга',
        STOP_MINING : 'Майнинг остановлен',
        AUTH_WAX_CLOUD : 'Переход на страницу вакс-кошелька',
        TOKEN_REMOVE : 'Токен сессии был удалён',
        PREPARATION_MINING : 'Запуск майнига',
        TOKEN_MINING : 'Майниг отменён, нет токена',
        OK : 'Успешное получение триллиума',
        ERROR : 'Перезапуск майнинга',
        SOON : 'Клаймить рано, время клайма изменилось',
        LONG_SIGN_PROCESS : 'Долго пытался подписать...',
        WAITIG_CPU : 'Ожидания готовности по CPU',
        WAX_AUTH_POPUP : 'Прохождение Авторизации через WAX-Popup',
        WAX_AUTH_SUCCESS : 'Авторизация через WAX-Popup успешно пройдено',
        WAX_AUTH_FAIL : 'Авторизация через WAX-Popup не пройдена',
        WAX_SIGNED : 'Подпись транзакции',
        MINING_LAST : 'Вычисление крайнего клайма',
        BLCH_ERROR : 'Блокчейн ответил ошибкой',
        LONG_MINING : 'Майнинг длиться слишком долго, прерывание...'
    }

    lang.pagination_first = 'Начало'
    lang.pagination_last = 'Конец'
    lang.breadcrumb_home = 'Главная'

    lang.errors = {

        error404 : {
            title : 'Страница не существует',
            header : 'Ошибка 404. Страница на которую вы перешли - не существует, либо она была удалена',
            content : 'В случае возникновения вопросов используйте наш телеграмм канал для получения поддержки от нас'
        },
        
        auth_header : 'Ошибка авторизации',
        auth_message : 'По всей видимости, срок авторизации истёк. Пройдите заново процедуру авторизации',
        
        input_header : 'Ошибка заполнения',
        input_message : 'По всей видимости, вы допустили ошибки в полях. Необходимо их исправить',
        
        error_header : 'Неизвестная ошибка на сервере',
        error_message : 'Сервер неожиданно отказался сотрудничать. Повторите запрос позже или напишите в тех-поддержку'
        
    }

    lang.accounts_colors = { 
        active: { color: 'success', header: 'Активен' },
        disabled: { color: 'dark', header: 'Отключен' },
        ban: { color: 'danger', header: 'Бан' }
    }

    lang.registry = {
        wait: 'Подождите...',
        ok: 'Доступно аккаунтов для майнинга:',
        ok2: 'Баланс:',
        ok_btn: 'Расширить',
        no: 'Программа не зарегистрированна. Для доступа к майнингу получите токен.',
        no_btn: 'Получить',
        no_mining: 'Необходимо прежде чем запустить майнинг, указать токен в настройках программы и иметь активные аккаунты alienworld',
        no_saved: 'Необходимо прежде остановить майнинг, что бы иметь возможность сохранить ваши установки',
        limited: 'Вы достигли лимита аккаунтов. Вам необходимо расширить возможности вашего токена'
    }

    lang.impex = {
        err_fail: 'Файл оказался непригодным для импорта',
        err_limited: 'Превышенно допустимое число аккаунтов в файле импорта'
    }

    lang.pages = {}

    lang.pages.home = {
        title : 'Профессиональное автоматизированное ПО по майнингу Trillium (TLM) в приватном режиме',

        toWorked : 'В Работе:',
        runAll : 'Запустить всё',
        stopedAll : 'Остановить всё',
        countWorkedWindow : 'Кол-во рабочих окон',
        activeAs_window : 'Держать %s ',
        activeAs_wariants: ['окно', 'окна', 'окон'],
        
        worked_account: 'Аккаунт',
        worked_event : 'Событие',

        active_kandidats : 'Кандидаты:',
        active_group : 'Активная группа:',
        activeSecAs : 'Каждые %s сек',
        activeInvTotam : 'Интервал выдачи:',
        activeIntvRunBots : 'Интервал запуска ботов',

        kan_account : 'Аккаунт',
        kan_status : 'Состояние',
        kan_clime : 'Крайний Клайм',
        kan_cpu : 'CPU',

        list_wait_not_group: 'Без группы',

        activity_funBasic : 'Базовые функции',
        activity_quitAccount : 'Войти в аккаунт',
        activity_getToken : 'Получить токен',
        activity_killProccess : 'Завершить процесс',
        activity_LogsTotay : 'Логи за сегодня:',
        activity_Upload : 'Загрузить',

        js_aborted_hand: 'Прерванно принудительным способом',
        js_account_activity: 'Активность аккаунта',

        activity_header: 'Активность аккаунта'

    }
    
    lang.pages.group = {

        header_create: 'Создание группы',
        header_edit : 'Изменение группы',

        edited : 'Группа изменена', 
        created : 'Группа добавлена',

        add : 'Добавить',
        // modal_header_new : 'Новая группа',
        reload : 'Обновить',
        number : 'Номер',
        nazvanie : 'Название',
        rangeWorks : 'Режим работы',
        imp : '<i class="fa fa-download" aria-hidden="true"></i> Import *.XLSx',
        exp : '<i class="fa fa-upload" aria-hidden="true"></i> Export *.XLSx',
        exp_pattern : '<i class="fa fa-file-excel-o" aria-hidden="true"></i> Шаблон *.XLSx',

        forma_nazvanie : 'Название',
        forma_rangeWorks : 'Режим работы',
        forma_save : 'Сохранить',

        // listing_newGroup : 'Новая группа',
        listing_worked_is : 'Работает с %s',
        listing_js_removed : 'Точно удалить эту группу?',
        js_isImportant: 'Импорт УДАЛИТ ВСЕ группы, и загрузит новые из указанного вами файла. Точно хотите продолжить?'

    }
    
    lang.pages.settings = {
        server_legend : 'Cервер',
        server : 'Адрес сервера',
        token : 'Токен',
        mining_sett : 'Настройка майнинга ( По умолчанию )',
        cpu_control : 'Интервал проверки CPU',
        wax_control : 'Интервал проверки WAX Баланса',
        tlm_control : 'Интервал проверки TLM Баланса',
        clm_control : 'Интервал проверки крайнего клайма',
        vidachy_interv : 'Интервал выдачи',
        countOpenedWindow : 'Кол-во открытых окон',
        MinValCPU : 'Мин. значение CPU',
        UI : 'Интерфейс',
        UILang : 'Язык интерфейса ( Требуется перезапуск программы )',
        save : 'Сохранить',
        saveOK : 'Настройки сохранены',

        activeAs : 'Держать %s ',
        activeAs_wariants: ['окно', 'окна', 'окон'],
        activeSecAs : 'Каждые %s сек',

        block_mail: 'Работа с почтой',
        imap_port_default: 'IMAP-Port по умолчанию',
        mail_timeout: 'Пытаться искать код на почте',

        mining_predel: 'Предельное время для майнинга, сек',
        block_session: 'Процесс получения токена сессии',
        count_potoks: 'Кол-во потоков',
        count_potoks_variants: ['поток', 'потока', 'потоков'],
        mail_timeout_var: '%s сек.',
        label_mail_visible: 'Показывать для Email ( Режим кнопки )',
        label_reddit_visible: 'Показывать для Reddit ( Режим кнопки )',
        label_mail_bender_visible: 'Показывать для Email ( Режим майнинга )',
        label_reddit_bender_visible: 'Показывать для Reddit ( Режим майнинга )',

        block_reznoe: 'Другое',
        label_wallet_aw_tools: 'Показывать вкладку AW Tools при открытии кошелька',
        label_mining_visible: 'Показывать окно с процессом майнинга',

        select_ok: 'Да', 
        select_no: 'Нет', 
    }

    
    lang.pages.accounts = {

        created : 'Создание аккаунта',
        edited : 'Изменение аккаунта',

        created_message : 'Аккаунт добавлен',
        edited_message : 'Аккаунт изменён',

        js_isRemoved:   'Точно удалить этот аккаунт?',
        js_isImportant: 'Импорт УДАЛИТ ВСЕ аккаунты, и загрузит новые из указанного вами файла. Точно хотите продолжить?',

        dobavit : 'Добавить',
        // dobav/it_header : 'Новый аккаунт',
        imp : '<i class="fa fa-download" aria-hidden="true"></i> Import *.XLSx',
        exp : '<i class="fa fa-upload" aria-hidden="true"></i> Export *.XLSx',
        exp_pattern : '<i class="fa fa-file-excel-o" aria-hidden="true"></i> Шаблон *.XLSx',

        account : 'Аккаунт',
        mining : 'Майнинг',
        balance : 'Баланс',

        form_token_mode_header : 'Аккаунт зарегистрирован через..',
        form_mail : 'Почтовый ящик',
        form_mail_danger : 'Обязательно разрешите в настройках сбор через imap',
        form_mail_email : 'Email',
        form_mail_pass : 'Пароль',
        form_mail_imap : 'IMAP-Сервер',
        form_mail_port : 'IMAP-Порт',
        form_mail_tls :  'IMAP-tls',

        form_title_reddit : 'Авторизационные данные Reddit',
        form_title_wax : 'Авторизационные данные WAX',
        form_reddit_username : 'Username',
        form_reddit_password : 'Пароль',

        form_wax : 'Wax',
        form_wax_wallet : 'Кошелёк',

        form_wax_aw : 'Alienworlds',
        form_wax_aw_resets : 'Время перезарядки, сек',

        system_settings_mincpu : 'Мин. значение CPU для клайма',
        system_settings_rest_timeout : 'Сек. отдыхать в случае неуспешного клайма',
        system_settings : 'Системные настройки',

        system_settings_group : 'Группа',

        system_settings_activity : 'Активность',
        system_settings_activity_worked : 'Работает',
        system_settings_activity_disabled : 'Отключен',
        system_settings_activity_baned : 'Забанен',

        system_settings_notes : 'Свои отметки',
        save : 'Сохранить',

        token_error_209: 'Во время получения токена произошла ошибка (209)',
        token_success: 'Токен успешно получен',

        list_not_group: 'Без группы',
        list_new_account: 'Новый аккаунт',
        list_not_info: 'Нет информации',
        list_clime_not_result: 'Нет информации',

        list_opt_change: 'Изменить',
        // list_opt_change_header: 'Изменение информации аккаунта',
        list_opt_update: 'Обновить токен',
        list_opt_quit: 'Войти в WAX-Wallet',
        list_opt_rem: 'Удалить',

        js_test_mail_error_input: 'Не достаточно данных для проверки'

    }

    lang.logs = {
        start_log : 'Попытка загрузить окно для авторизации',
        auth_wallet : 'Авторизация на странице кошеля',
        set_cookie : 'Установка всех необходимых cookie',
        runMin : 'Подготовка инструментов майнинга',
        runSka : 'Запуск сканера',
        isWxClosed : 'Пытаюсь убедиться что открытое окно с авторизацией закрылось',
        startSka : 'Запускаю заново сканер',
        stopSka : 'Отключаю временно сканер',
        isAuthAcc : 'Ожидаю, пока аккаунт авторизуется',
        isClosedSign : 'Пытаюсь убедиться что открыто окно с подписью закрылось',
        clickSign2 : 'Новое окно закрылось - жму подписать транзакцию',
        startSkaner : 'Запускаю заново сканер',
        stopSkaner : 'Отключаю временно сканер',
        clickSign1 : 'Новое окно открылось - жму подписать транзакцию',
        isSigned : 'Ожидаю, пока транзакция подпишется'
    }

    lang.dest = {
        longAuth : 'Долгая авторизация, перезапуск',
        longMining : 'Долго идёт процесс майнинга, перезапуск сессии..',
        longCPU : 'Долго идёт процесс накопления CPU, перезапуск сессии..',
        longSign : 'Долго подписывали транзакцию, перезапуск сессии..',
        success : 'Успешный майнинг',
        errorCPU : 'Ошибка CPU',
        default : 'Окно молча закрылось...',
        tokenErr : 'Требуется новый токен авторизации',
        errorAuth : 'Видимо с окном авторизации не разобрались',
        errorSign : 'Видимо с окном подписи не разобрались',
        errorTokenError : 'Токен неверный, либо его не существует',
        errorAccountError : 'Аккаунт содержит ошибки, попробуйте удалить и заново его добавить'
    }

    lang.ev = {
        auth: 'Попытка авторизации...',
        mining: 'Идёт процесс майнинга',
        upcpu: 'Ожидаем уровня CPU: ',
        sign: 'Подписывание транзакции',
        success: 'Успешное получение трилиума',
        disabled: 'Необходимо заново получить токен для доступа. Аккаунт был выключен',
        tokenError : 'Токен неверный, либо его не существует',
        accountError : 'Аккаунт содержит ошибки, попробуйте удалить и заново его добавить'
    }

module.exports = lang
