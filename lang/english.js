var lang = {};

    lang.ext = 'ru'
    lang.date_short = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]
    lang.date_full = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
    lang.date_time_v = " в "

    lang.bell = {
        alert : {
            default : 'System error',
            success : 'OK',
            error : 'error'
        },
        confirm : {
            buttons : ['Ок','Cancel'],
            header: 'Confirmation'
        }
    }
	
    lang.nav = {
        mining : 'Mining',
        accounts : 'Accounts',
        groups : 'Groups',
        settings : 'Settings',
        information : 'Info'
    }

    lang.buffer = {
        header : 'Exchange Buffer',
        message : 'Text copied successfully'
    }

    lang.mining_status = {
        WAITING: 'Waiting to launch',
        COMPLETED: 'Ready to launch',
        GET_TOKEN_PROCESS: 'Process for getting session token',
        GET_TOKEN_SUCCESS : 'Session token received',
        GET_TOKEN_ERROR : 'Session token not received',
        START_MININNG : 'Initiating mining facilities',
        STOP_MINING : 'Mining stopped',
        AUTH_WAX_CLOUD : 'Navigating to the wax wallet page',
        TOKEN_REMOVE : 'The session token has been deleted',
        PREPARATION_MINING : 'Mining has been started',
        TOKEN_MINING : 'Mining has been cancelled, no token',
        TLMOK : 'Successfully obtained trillium',
        ERROR : 'Restarting mining',
        SOON : 'Claim early, clime time has changed',
        LONG_SIGN_PROCESS : 'Took a long time to sign...',
        WAITIG_CPU : 'Waiting for CPU availability',
        WAX_AUTH_POPUP : 'Passing the Authorization via WAX-Popup',
        WAX_AUTH_SUCCESS : 'WAX-Popup authorization passed successfully',
        WAX_AUTH_FAIL : 'Authorization via WAX-Popup not passed',
        WAX_SIGNED : 'Signing a transaction',
        MINING_LAST : 'Calculating an edge clause',
        BLCH_ERROR : 'Blockchain has refused to cooperate',
        LONG_MINING : 'Mining is taking too long, abort...'
    }
	
    lang.pagination_first = 'Start'
    lang.pagination_last = 'End'
    lang.breadcrumb_home = 'Home'

    lang.errors = {

        error404 : {
            title : 'The page does not exist',
            header : 'Error 404. The page you linked to does not exist, or has been removed',
            content : 'If you have any questions please use our telegram channel to get support from us'
        },
        
        auth_header : 'Authorization error',
        auth_message : 'It looks like your authorization period has expired. Please go through the authorization process again',
        
        input_header : 'Filled in error',
        input_message : 'You seem to have made mistakes in the fields. You need to correct them',
        
        error_header : 'Unknown error on server',
        error_message : 'The server unexpectedly refused to cooperate. Please try again later or contact technical support.'
        
    }

    lang.accounts_colors = { 
        active: { color: 'success', header: 'Active' },
        disabled: { color: 'dark', header: 'Disabled' },
        ban: { color: 'danger', header: 'Ban' }
    }

    lang.registry = {
        wait: 'Wait...',
        ok: 'Accounts available for mining:',
        ok2: 'Balance:',
        ok_btn: 'Expand',
        no: 'The program is not registered. Get a token to access the mining.',
        no_btn: 'Get',
        no_mining: 'It is necessary to specify a token in the program settings and have active alienworld accounts before you can start mining',
        no_saved: 'You must stop mining before you can save your settings',
        limited: 'You have reached your account limit. You need to expand your token capabilities.'
    }

    lang.impex = {
        err_fail: 'The file was unsuitable for import',
        err_limited: 'The allowed number of accounts in the import file was exceeded.'
    }
	
    lang.pages = {}

	lang.pages.home = {
        title : 'Trillium professional automated mining software (TLM) in private mode',

        toWorked : 'At Work:',
        runAll : 'Run all',
        stopedAll : 'Stop everything',
        countWorkedWindow : 'Number of working windows',
        activeAs_window : 'Hold %s ',
        activeAs_wariants : ['window', 'windows', 'windows'],
        
        worked_account : 'Account',
        worked_event : 'event',

        active_kandidats : 'Candidates:',
        active_group : 'Active group:',
        activeSecAs : 'Every %s seconds',
        activeInvTotam : 'Dispensing interval:',
        activeIntvRunBots : 'Bot launch interval',

        kan_account : 'Account',
        kan_status : 'Status',
        kan_clime : 'Last claim',
        kan_cpu : 'CPU',

        list_wait_not_group : 'No group',

        activity_funBasic : 'Basic functions',
        activity_quitAccount : 'Log in to account',
        activity_getToken : 'Get Token',
        activity_killProccess : 'End process',
        activity_LogsTotay : 'Logs for today:',
        activity_Upload : 'Upload',

        js_aborted_hand : 'Interrupted forcibly',
        js_account_activity : 'Account activity',
        no_token: 'No session token',

        activity_header: 'Account activity'

    }
    
    lang.pages.group = {

        header_create : 'Creating a group',
        header_edit : 'Changing the group',

        edited : 'Group edited', 
        created : 'Group added',

        add : 'Add',
        // modal_header_new : 'New Group',
        reload : 'Refresh',
        number : 'Number',
        nazvanie : 'Name',
        rangeWorks : 'Mode of operation',
        imp : '<i class="fa fa-download" aria-hidden="true"></i> Import *.XLSx',
        exp : '<i class="fa fa-upload" aria-hidden="true"></i> Export *.XLSx',
        exp_pattern : '<i class="fa fa-file-excel-o" aria-hidden="true"></i> Template *.XLSx',

        forma_nazvanie : 'Name',
        forma_rangeWorks : 'Mode of operation',
        forma_save : 'Save',

        // listing_newGroup : 'New Group',
        listing_worked_is : 'Works with %s',
        listing_js_removed : 'Exactly delete this group?',
        js_isImportant : 'Import will DELETE ALL groups, and load new ones from the file you specify. Are you sure you want to continue?'

    }
	
	
	lang.pages.settings = {
		   
        server_legend : 'Server',
        server : 'server address',
        token : 'Token',
        mining_sett : 'Mining setting ( Default)',
        cpu_control : 'CPU check interval',
        wax_control : 'WAX Balance Check Interval',
        tlm_control : 'TLM Balance Check Interval',
        clm_control : 'Check interval of the edge clime',
        vidachy_interv : 'Dispense interval',
        countOpenedWindow : 'Number of open windows',
        MinValCPU : 'Min CPU value',
        UI : 'Interface',
        UILang : 'Interface language ( Program restart required)',
        save : 'Save',
        saveOK : 'Settings saved',

        activeAs : 'Hold %s ',
        activeAs_wariants : ['window', 'windows', 'windows'],
        activeSecAs : 'Every %s sec',

        block_mail: 'Mail handling',
        imap_port_default : 'Default IMAP-Port',
        mail_timeout : 'Trying to look up code in the mail',

        mining_predel: 'Limit time for mining, sec',
        block_session: 'The process of getting the session token',
        count_potoks: 'Number of threads',
        count_potoks_variants: ['thread', 'threads', 'threads'],
        mail_timeout_var: '%s sec',
        label_mail_visible: 'Show for Email ( Button mode )',
        label_reddit_visible: 'Show for Reddit ( Button mode )',
        label_mail_bender_visible: 'Show for Email ( Mining mode )',
        label_reddit_bender_visible: 'Show for Reddit ( Mining Mode )',

        block_reznoe: 'Other',
        label_wallet_aw_tools: 'Show AW Tools tab when opening a wallet',
        label_mining_visible: 'Show the window with the mining process',

        select_ok: 'Yes', 
        select_no: 'No', 
    }

    
    lang.pages.accounts = {

        created : 'Create account',
        edited : 'Changing the account',

        created_message : 'Account added',
        edited_message : 'Account changed',

        js_isRemoved : 'Are you sure to delete this account?',
        js_isImportant : 'Import will DELETE ALL accounts, and load new ones from the file you specified. Are you sure you want to continue?',

        dobavit : 'Add',
        // dobav/it_header : 'Новый аккаунт',
        imp : '<i class="fa fa-download" aria-hidden="true"></i> Import *.XLSx',
        exp : '<i class="fa fa-upload" aria-hidden="true"></i> Export *.XLSx',
        exp_pattern : '<i class="fa fa-file-excel-o" aria-hidden="true"></i> Template *.XLSx',

        account : 'account',
        mining : 'mining',
        balance : 'balance',

        form_token_mode_header : 'Account is registered through',
        form_mail : 'Mailbox',
        form_mail_danger : 'Be sure to allow collection via imap in the settings',
        form_mail_email : 'Email',
        form_mail_pass : 'Password',
        form_mail_imap : 'IMAP Server',
        form_mail_port : 'IMAP Port',
        form_mail_tls : 'IMAP-tls',

        form_title_reddit : 'Reddit authorization data',
        form_title_wax : 'WAX authorization data',
        form_reddit_username : 'Username',
        form_reddit_password : 'Password',

        form_wax : 'Wax',
        form_wax_wallet : 'Wallet',

        form_wax_aw : 'Alienworlds',
        form_wax_aw_resets : 'Reload time, sec',

        system_settings_mincpu : 'Min CPU value for clime',
        system_settings_rest_timeout : 'Rest in case of unsuccessful clime',
        system_settings : 'System settings',

        system_settings_group : 'Group',

        system_settings_activity : 'Activity',
        system_settings_activity_worked : 'Working',
        system_settings_activity_disabled : 'Disabled',
        system_settings_activity_baned : 'Banned',

        system_settings_notes : 'Your marks',
        save : 'Save',

        token_error_209 : 'An error (209) occurred while receiving the token',
        token_success : 'Token successfully received',

        list_not_group: 'No group',
        list_new_account: 'New account',
        list_not_info: 'No information',
        list_clime_not_result: 'No info',

        list_opt_change: 'Change',
        // list_opt_change_header: 'Change account information,
        list_opt_update: 'Update token',
        list_opt_quit: 'Login to WAX-Wallet',
        list_opt_rem: 'Delete',

        js_test_mail_error_input: 'Not enough data to check'

    }

    lang.pages.info = {
        header: 'Info',
        tg_kanal: 'Telegram сhannel:',
        techsupport: 'Technical support:',
        site: 'Website:'
    }

    lang.logs = {
        start_log : 'Attempting to load the authorization window',
        auth_wallet : 'Authorization on the wallet page',
        set_cookie : 'Setting all required cookies',
        runMin : 'Preparing the mining tools',
        runSka : 'Launching the scanner',
        isWxClosed : 'Trying to make sure the open authorization window is closed',
        startSka : 'Restarting the scanner',
        stopSka : 'Scaner stop',
        isAuthAcc : 'Waiting for the account to be authorized',
        isClosedSign : 'Trying to make sure the signature window is closed',
        clickSign2 : 'The new window has closed - I am trying to sign the transaction',
        startSkaner : 'I restart the Scaner',
        stopSkaner : 'Scaner stop',
        clickSign1 : 'A new window opened - click to sign the transaction',
        isSigned : 'Waiting for transaction to be signed.'
    }

    lang.dest = {
        longAuth : 'Long authorization, restart',
        longMining : 'LongMining process, restarting session...',
        longCPU : 'Long CPU accumulation process, session restart...',
        longSign : 'It takes a long time to sign a transaction, session restart...',
        success : 'Successful mining',
        errorCPU : 'CPU error',
        default : 'The window silently closed...',
        tokenErr : 'New authorization token required',
        errorAuth : 'The authorization window seems to be broken',
        errorSign : 'The signature window seems to be broken',
        errorTokenError : 'The token is incorrect or does not exist',
        errorAccountError : 'The account has errors, try deleting it and adding it again.'
    }

    lang.ev = {
        auth : 'Attempting to authorize...',
        mining: 'Mining process in progress',
        upcpu: 'Waiting for CPU level: ',
        sign: 'Signing transaction',
        success: 'Successful acquisition of trilium',
        disabled: 'Need to reacquire token for access. The account has been disabled',
        tokenError : 'The token is incorrect or does not exist',
        accountError : 'The account has errors, try deleting it and adding it again.'
    }

module.exports = lang