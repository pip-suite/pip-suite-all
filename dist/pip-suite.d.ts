declare module pip.rest {

export const UnauthorizedRedirect: string;
export const AccessDenyRedirect: string;




export interface IAuthState extends angular.ui.IState {
    auth?: boolean;
    authenticate?: any;
}
export class AuthStateConfig {
    signinState: string;
    signoutState: string;
    authorizedState: string;
    unauthorizedState: string;
}
export interface IAuthStateService extends ng.ui.IStateService {
    signinState(value?: string): string;
    signoutState(value?: string): string;
    authorizedState(value?: string): string;
    unauthorizedState(value?: string): string;
    redirect(event: ng.IAngularEvent, toState: IAuthState, toParams: any, $rootScope: ng.IRootScopeService): any;
    state(stateName: string, stateConfig: IAuthState): any;
    goToSignin(params: any): void;
    goToSignout(params: any): void;
    goToAuthorized(params: any): void;
    goToUnauthorized(params: any): void;
}
export interface IAuthStateProvider extends ng.IServiceProvider {
    redirect(fromState: string, toState: string): any;
    signinState: string;
    signoutState: string;
    authorizedState: string;
    unauthorizedState: string;
}



export class CacheParams {
    force?: boolean;
    resource?: string;
    filter?: Function;
    singleResult?: boolean;
    search?: string;
    start?: any;
    take?: number;
    skip?: number;
    notClearedCache?: boolean;
    paging?: boolean;
    updatedItem?: any;
}
export interface IDataCacheService {
    setTimeout(newTimeout: number): number;
    store(resource: string, data: any, params?: CacheParams): void;
    storePermanently(resource: string, data: any, params?: CacheParams): void;
    retrieve(resource: string, params?: CacheParams): any;
    retrieveOrLoad(params: CacheParams, successCallback?: (data: any) => void, errorCallback?: (err: any) => void): any;
    updateOne(resource: string, item: any, params?: CacheParams): void;
    remove(resource: string, params?: CacheParams): void;
    removeOne(resource: string, item: any): void;
    clear(resource?: string): void;
    decorateAddCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function;
    decorateUpdateCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function;
    decorateRemoveCallback(resource: string, params?: CacheParams, successCallback?: (data: any) => void): Function;
}
export interface IDataCacheProvider extends ng.IServiceProvider {
}



export interface IDataModelService {
    execute(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    create(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    update(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    delete(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    read(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    readOne(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    page(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    uploadFiles(params: any, successCallback?: () => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    save(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    remove(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    query(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    get(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    readPage(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
    queryPage(params: any, successCallback?: (result: any) => void, errorCallback?: (error: any) => void): ng.IPromise<{}>;
}
export interface IDataModelProvider extends ng.IServiceProvider {
}



export interface IRestService {
    serverUrl: string;
    lockServerUrl: boolean;
    setHeaders(headers: any): any;
    getResource(name: string): any;
}
export interface IRestProvider {
    serverUrl: string;
    lockServerUrl: boolean;
    setHeaders(headers: any): any;
    registerResource(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerOperation(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerPagedCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
    registerPartyCollection(name: string, path: string, defaultParams?: any, actions?: any): void;
}


}

declare module pip.entry {

export class ChangePasswordController {
    private pipChangePasswordViewModel;
    private $window;
    constructor($state: ng.ui.IStateService, pipChangePasswordViewModel: ChangePasswordViewModel, pipEntryCommon: IEntryCommonService, pipEntry: IEntryService, pipAuthState: pip.rest.IAuthStateService, pipSession: pip.services.ISessionService, $window: ng.IWindowService);
    goBack(): void;
    readonly config: any;
    onChange(): void;
}

export interface IChangePasswordDialogService {
    show(params: any, successCallback?: () => void, cancelCallback?: () => void): void;
}

export class ChangePasswordModel extends EntryModel {
    private $rootScope;
    private $location;
    private $state;
    private $injector;
    private pipAuthState;
    private pipFormErrors;
    private pipRest;
    private pipTranslate;
    private pipEntryData;
    private pipEntry;
    private pipToasts;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipTranslate: pip.services.ITranslateService, pipEntryData: IEntryDataService, pipEntry: IEntryService, pipToasts: pip.controls.IToastService);
    init($scope: any): void;
    private setElementVisability();
    onShowToast(message: string, type: string): void;
    onChange(callback?: () => void): void;
}


export class ChangePasswordViewModel {
    private pipTranslate;
    private pipEntryData;
    private pipToasts;
    model: ChangePasswordModel;
    constructor(pipEntryCommon: any, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipEntry: IEntryService, pipTranslate: pip.services.ITranslateService, pipEntryData: any, pipToasts: any);
    readonly transaction: pip.services.Transaction;
    readonly hideObject: any;
    readonly showServerError: any;
    readonly config: any;
    initModel($scope: any): void;
    onShowToast(message: any, type: any): void;
    onChange(callback?: () => void): void;
}



export class EntryHideObject {
    remember?: boolean;
    title?: boolean;
    server?: boolean;
    forgotPassword?: boolean;
    signup?: boolean;
    hint?: boolean;
    progress?: boolean;
    subTitle?: boolean;
    successTitle?: boolean;
    subTitle1?: boolean;
    subTitle2?: boolean;
    agreement?: boolean;
    passwordConfirm?: boolean;
    signin?: boolean;
    resetSubTitle?: boolean;
    changePwdTitle?: boolean;
    changePwdSubTitle?: boolean;
}


export class EntryModel {
    pipEntryCommon: IEntryCommonService;
    config: EntryPageConfig;
    hideObject: EntryHideObject;
    showServerError: boolean;
    transaction: pip.services.Transaction;
    constructor(pipEntryCommon: IEntryCommonService);
    protected initModel($scope: any): void;
}

export class EntryPageConfig extends EntryConfig {
    data: EntryDataConfig;
    showServerUrl: boolean;
    serverUrls: string[];
    servers: IPastSessions;
    selected: any;
    filterItem: Function;
    getMatches: Function;
    onServerUrlChanged: Function;
    isEmpty: Function;
    form: any;
}
export class EntryDataConfig {
    login: string;
    serverUrl: string;
    email: string;
    password: string;
    passwordNew?: string;
    remember: boolean;
    adminOnly: boolean;
    name: string;
    code: string;
    resetCode: string;
}
export class SigninParams {
    email?: string;
    login: string;
    serverUrl: string;
    password?: string;
    remember?: boolean;
    adminOnly?: boolean;
}
export class SignupParams {
    login: string;
    email?: string;
    name?: string;
    serverUrl: string;
    password?: string;
    remember?: boolean;
    adminOnly?: boolean;
    language?: string;
    theme?: string;
    time_zone?: string;
}
export class AuthSessionData {
    serverUrl: string;
    sessionId: string;
    userId: string;
}
export class PastSession {
    login: string;
    serverUrl: string;
}
export interface IPastSessions {
    [key: string]: PastSession;
}

export interface IEntryService {
    appbarTitle: string;
    appbarIcon: string;
    showIcon: boolean;
    showLanguage: boolean;
    adminOnly: boolean;
    fixedServerUrl: boolean;
    enableAvatar: boolean;
    useEmailAsLogin: boolean;
    isPostSignup: boolean;
    passwordExpire: boolean;
    entryHideObject: EntryHideObject;
    openSession(data: SessionData, remember?: boolean): void;
    getUserId(data: SessionData): string;
    reopenSession(): void;
    closeSession(): void;
    signout(successCallback?: () => void): void;
}
export interface IEntryProvider {
    appbarTitle: string;
    appbarIcon: string;
    showIcon: boolean;
    showLanguage: boolean;
    adminOnly: boolean;
    fixedServerUrl: boolean;
    enableAvatar: boolean;
    useEmailAsLogin: boolean;
    isPostSignup: boolean;
    passwordExpire: boolean;
    entryHideObject: EntryHideObject;
}
export class EntryConfig {
    appbarTitle: string;
    appbarIcon: string;
    showIcon: boolean;
    showLanguage: boolean;
    adminOnly: boolean;
    fixedServerUrl: boolean;
    enableAvatar: boolean;
    useEmailAsLogin: boolean;
    isPostSignup: boolean;
    entryHideObject: EntryHideObject;
    passwordExpire: boolean;
}


export interface IEntryCommonService {
    configureAppBar(): void;
    initScope($scope: any): EntryPageConfig;
}


function compareOldPassword($parse: ng.IParseService): ng.IDirective;
function compareNewPassword($parse: ng.IParseService): ng.IDirective;
function comparePasswordMatch($parse: ng.IParseService): ng.IDirective;

export class Account {
    roles: string[];
    theme: string;
    language: string;
    time_zone: string;
    create_time: string;
    change_pwd_time: string;
    login: string;
    name: string;
    id: string;
    custom_hdr?: any;
    custom_dat?: any;
    settings?: any;
}

export class EmailSettings {
    name?: string;
    email?: string;
    language?: string;
    verified?: boolean;
    id?: string;
}


export class GENDER {
    static MALE: 'male';
    static FEMALE: 'female';
    static NOT_SPECIFIED: 'n/s';
}

export interface IEntryDataService {
    getUserId(): string;
    signup(params: any, successCallback?: (user: SessionData) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    recoverPassword(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    resetPassword(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    expireChangePassword(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    requestEmailVerification(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    verifyEmail(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    signupValidate(login: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    saveSettingsKey(section: string, key: string, value: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
}


export interface ISessionDataService {
    getSessionId(): string;
    getUserId(): string;
    getSessions(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    restoreSession(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    getUserSessions(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
}

export class Role {
}

export class Session {
    user_id: string;
    user_name: string;
    address: string;
    client: string;
    request_time: string;
    open_time: string;
    active: boolean;
    id: string;
}

export class SessionData extends Session {
    user: Account;
    data: any;
    change_pwd_time?: string;
}


export class ExpireChangePasswordController {
    private pipExpireChangePasswordViewModel;
    private $window;
    constructor($state: ng.ui.IStateService, pipExpireChangePasswordViewModel: ExpireChangePasswordViewModel, pipEntryCommon: IEntryCommonService, pipEntry: IEntryService, pipAuthState: pip.rest.IAuthStateService, pipSession: pip.services.ISessionService, $window: ng.IWindowService);
    goBack(): void;
    readonly config: any;
    onChange(): void;
}

export interface IExpireChangePasswordDialogService {
    show(params: any, successCallback?: () => void, cancelCallback?: () => void): void;
}

export class ExpireChangePasswordModel extends EntryModel {
    private $rootScope;
    private $location;
    private $state;
    private $injector;
    private pipAuthState;
    private pipFormErrors;
    private pipRest;
    private pipTranslate;
    private pipEntryData;
    private pipEntry;
    private pipToasts;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipTranslate: pip.services.ITranslateService, pipEntryData: IEntryDataService, pipEntry: IEntryService, pipToasts: pip.controls.IToastService);
    init($scope: any): void;
    private setElementVisability();
    onShowToast(message: string, type: string): void;
    onChange(callback?: () => void): void;
}


export class ExpireChangePasswordViewModel {
    private pipTranslate;
    private pipEntryData;
    private pipToasts;
    model: ExpireChangePasswordModel;
    constructor(pipEntryCommon: any, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipEntry: IEntryService, pipTranslate: pip.services.ITranslateService, pipEntryData: any, pipToasts: any);
    readonly transaction: pip.services.Transaction;
    readonly hideObject: any;
    readonly showServerError: any;
    readonly config: any;
    initModel($scope: any): void;
    onShowToast(message: any, type: any): void;
    onChange(callback?: () => void): void;
}

export class PostSignupController implements ng.IController {
    private $window;
    $party: any;
    private pipPostSignupViewModel;
    $onInit(): void;
    constructor($window: ng.IWindowService, $party: any, pipPostSignupViewModel: PostSignupViewModel);
    onPostSignupSubmit(): void;
    readonly transaction: any;
}

export interface IPostSignupDialogService {
    show(params: any, successCallback?: () => void, cancelCallback?: () => void): void;
}

export class PostSignupModel extends EntryModel {
    private $rootScope;
    private $location;
    private $state;
    private $injector;
    private pipErrorPageConfigService;
    private pipAuthState;
    private pipFormErrors;
    private pipEntry;
    private pipRest;
    private pipTranslate;
    private pipEntryData;
    private pipToasts;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipErrorPageConfigService: pip.errors.IErrorPageConfigService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipEntry: IEntryService, pipRest: pip.rest.IRestService, pipTranslate: pip.services.ITranslateService, pipEntryData: IEntryDataService, pipToasts: pip.controls.IToastService);
    init($scope: any): void;
    private setElementVisability();
    private checkSupported();
    onPostSignupSubmit(callback?: () => void): void;
}


export class PostSignupViewModel {
    private pipTranslate;
    private pipEntryData;
    private pipToasts;
    model: PostSignupModel;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipErrorPageConfigService: pip.errors.IErrorPageConfigService, pipAuthState: pip.rest.IAuthStateService, pipEntry: IEntryService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipTranslate: pip.services.ITranslateService, pipEntryData: IEntryDataService, pipToasts: pip.controls.IToastService);
    readonly transaction: pip.services.Transaction;
    readonly hideObject: any;
    readonly showServerError: any;
    readonly config: any;
    initModel($scope: any): void;
    onPostSignupSubmit(callback?: () => void): void;
}

export class ResetPasswordController {
    private pipResetPasswordViewModel;
    private $window;
    constructor(pipResetPasswordViewModel: ResetPasswordViewModel, pipEntryCommon: IEntryCommonService, $window: ng.IWindowService);
    goBack(): void;
    readonly config: any;
    onReset(): void;
}

export interface IResetPasswordDialogService {
    show(params: any, successCallback?: () => void, cancelCallback?: () => void): void;
}

export class ResetPasswordModel extends EntryModel {
    private $rootScope;
    private $location;
    private $state;
    private $injector;
    private pipAuthState;
    private pipFormErrors;
    private pipRest;
    private pipTranslate;
    private pipEntryData;
    private pipToasts;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipTranslate: pip.services.ITranslateService, pipEntryData: IEntryDataService, pipToasts: pip.controls.IToastService);
    init($scope: any): void;
    private setElementVisability();
    onShowToast(message: string, type: string): void;
    onReset(callback?: () => void): void;
}


export class ResetPasswordViewModel {
    private pipTranslate;
    private pipEntryData;
    private pipToasts;
    model: ResetPasswordModel;
    constructor(pipEntryCommon: any, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipTranslate: pip.services.ITranslateService, pipEntryData: any, pipToasts: any);
    readonly transaction: pip.services.Transaction;
    readonly hideObject: any;
    readonly showServerError: any;
    readonly config: any;
    initModel($scope: any): void;
    onShowToast(message: any, type: any): void;
    onReset(callback?: () => void): void;
}

export class RecoverPasswordController {
    private $scope;
    private pipRecoverPasswordViewModel;
    private pipResetPasswordDialog;
    private $state;
    private pipAuthState;
    private pipFormErrors;
    private $window;
    constructor($scope: ng.IScope, pipRecoverPasswordViewModel: RecoverPasswordViewModel, pipResetPasswordDialog: IResetPasswordDialogService, pipEntryCommon: IEntryCommonService, $state: ng.ui.IStateService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, $window: ng.IWindowService);
    goBack(): void;
    readonly transaction: any;
    readonly config: any;
    onRecover(): void;
}

export interface IRecoverPasswordDialogService {
    show(params: any, successCallback?: () => void, cancelCallback?: () => void): void;
}

export class RecoverPasswordModel extends EntryModel {
    private $rootScope;
    private $location;
    private $state;
    private $injector;
    private pipAuthState;
    private pipFormErrors;
    private pipRest;
    private pipTranslate;
    private pipEntryData;
    private pipToasts;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipTranslate: pip.services.ITranslateService, pipEntryData: IEntryDataService, pipToasts: pip.controls.IToastService);
    init($scope: any): void;
    private setElementVisability();
    onRecover(gotoReset: () => void): void;
}


export class RecoverPasswordViewModel {
    private pipTranslate;
    private pipEntryData;
    private pipToasts;
    model: RecoverPasswordModel;
    constructor(pipEntryCommon: any, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipTranslate: pip.services.ITranslateService, pipEntryData: any, pipToasts: any);
    readonly transaction: pip.services.Transaction;
    readonly hideObject: any;
    readonly showServerError: any;
    readonly config: any;
    initModel($scope: any): void;
    onRecover(gotoReset: any): void;
}

function configEntryResources(pipRestProvider: pip.rest.IRestProvider): void;


function configSessionResources(pipRestProvider: pip.rest.IRestProvider): void;

function configSettingsResources(pipRestProvider: pip.rest.IRestProvider): void;

export const isSignin = "isSignin";

export interface ISigninDialogController {
    pipGotoSignupDialog: Function;
    pipGotoRecoverPasswordDialog: Function;
}

export class SinginModel extends EntryModel {
    private $rootScope;
    private $location;
    private $state;
    private $injector;
    private pipErrorPageConfigService;
    private pipAuthState;
    private pipEntry;
    private pipFormErrors;
    private pipNavService;
    private pipRest;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipErrorPageConfigService: pip.errors.IErrorPageConfigService, pipAuthState: pip.rest.IAuthStateService, pipEntry: IEntryService, pipFormErrors: pip.errors.IFormErrorsService, pipNavService: pip.nav.INavService, pipRest: pip.rest.IRestService);
    init($scope: any): void;
    private setElementVisability();
    private checkSupported();
    gotoSignup(gotoSignupPage: any, gotoSignupDialog: any): void;
    gotoRecoverPassword(gotoRecoverPasswordDialog: any): void;
    private inSigninComplete(data);
    private checkEmailVerification(data);
    onSignin(rememberDefault: boolean): void;
}


export class SigninViewModel {
    model: SinginModel;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipErrorPageConfigService: pip.errors.IErrorPageConfigService, pipAuthState: pip.rest.IAuthStateService, pipEntry: IEntryService, pipFormErrors: pip.errors.IFormErrorsService, pipNavService: pip.nav.INavService, pipRest: pip.rest.IRestService);
    readonly transaction: pip.services.Transaction;
    readonly hideObject: any;
    readonly showServerError: any;
    readonly config: any;
    initModel($scope: any): void;
    gotoSignup(gotoSignupPage: any, gotoSignupDialog: any): void;
    gotoRecoverPassword(gotoRecoverPasswordDialog: any): void;
    onSignin(rememberDefault: boolean): void;
}

export class SignoutController {
    constructor(pipAuthState: pip.rest.IAuthStateService, pipEntry: IEntryService);
}



export class SingupModel extends EntryModel {
    private $rootScope;
    private $location;
    private $state;
    private $injector;
    private pipAuthState;
    private pipFormErrors;
    private pipRest;
    private pipEntry;
    private pipEntryData;
    private pipTranslate;
    private session;
    private regestryVerifyEmailKey;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipEntry: IEntryService, pipEntryData: IEntryDataService, pipTranslate: pip.services.ITranslateService);
    init($scope: any): void;
    private setElementVisability();
    gotoSignin(gotoSigninPage: any, gotoSigninDialog: any): void;
    onSignup(gotoPostSignup: any): void;
}


export class SignupViewModel {
    model: SingupModel;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipEntry: IEntryService, pipEntryData: IEntryDataService, pipTranslate: pip.services.ITranslateService);
    readonly transaction: pip.services.Transaction;
    readonly hideObject: any;
    readonly showServerError: any;
    readonly config: any;
    initModel($scope: any): void;
    gotoSignin(gotoSigninPage: any, gotoSigninDialog: any): void;
    onSignup(gotoPostSignup: any): void;
}

export class VerifyEmailController {
    private $scope;
    private $window;
    private pipFormErrors;
    private pipVerifyEmailViewModel;
    private pipIdentity;
    private $timeout;
    showServerError: boolean;
    touchedErrorsWithHint: Function;
    form: any;
    data: any;
    error: any;
    serverUrl: string;
    email: string;
    showValidateProgress: boolean;
    constructor($scope: ng.IScope, $window: ng.IWindowService, pipFormErrors: pip.errors.IFormErrorsService, pipVerifyEmailViewModel: VerifyEmailViewModel, pipIdentity: pip.services.IIdentityService, $timeout: ng.ITimeoutService);
    goBack(): void;
    readonly config: EntryPageConfig;
    readonly transaction: any;
    onVerify(): void;
    onRecover(): void;
}
export class VerifyEmailSuccessController {
    private pipVerifyEmailViewModel;
    constructor($scope: ng.IScope, pipVerifyEmailViewModel: VerifyEmailViewModel);
    onContinue(): void;
}

export class VerifyEmailModel extends EntryModel {
    private $rootScope;
    private $location;
    private $state;
    private $injector;
    private pipAuthState;
    private pipFormErrors;
    private pipRest;
    private pipEntryData;
    private pipIdentity;
    private pipEntry;
    private regestryVerifyEmailKey;
    constructor(pipEntryCommon: IEntryCommonService, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipEntryData: IEntryDataService, pipIdentity: pip.services.IIdentityService, pipEntry: IEntryService);
    init($scope: any): void;
    private setElementVisability();
    onVerify(successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    onRecover(): void;
    onContinue(): void;
    onCancel(): void;
}

export class VerifyEmailViewModel {
    model: VerifyEmailModel;
    constructor(pipEntryCommon: any, pipTransaction: pip.services.ITransactionService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $state: ng.ui.IStateService, $injector: ng.auto.IInjectorService, pipAuthState: pip.rest.IAuthStateService, pipFormErrors: pip.errors.IFormErrorsService, pipRest: pip.rest.IRestService, pipEntryData: IEntryDataService, pipIdentity: pip.services.IIdentityService, pipEntry: IEntryService);
    readonly transaction: pip.services.Transaction;
    readonly hideObject: any;
    readonly showServerError: any;
    readonly config: any;
    initModel($scope: any): void;
    onVerify(successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    onRecover(): void;
    onContinue(): void;
    onCancel(): void;
}

}

declare module pip.split {

export interface ISplitService {
    forwardTransition(toState: any, fromState: any): boolean;
    goToDesktopState(fromState: string): string;
}
export interface ISplitProvider {
    addTransitionSequence(sequence: string[], mobileStates?: MobileState[]): void;
}
export class MobileState {
    name: string;
    toStateName: string;
}


}

declare module pip.pictures {


export class AddImageOption {
    Upload: boolean;
    WebLink: boolean;
    Camera: boolean;
    Galery: boolean;
}

export class AddImageResult {
    picture?: Attachment;
    file?: any;
    uriData?: any;
    url?: string;
}


export const ReloadAvatar = "pipReloadAvatar";
export class AvatarEditControl {
    reset: (afterDeleting?: boolean) => void;
    save: (id?: string, successCallback?: (response?: any) => void, errorCallback?: (error?: any) => void) => void;
    abort: () => void;
    error?: any;
    disabled: boolean;
    url: string;
    uriData: any;
    progress: number;
    uploaded: boolean;
    uploading: boolean;
    upload: boolean;
    loaded: boolean;
    file: any;
    state: string;
}
export class AvatarStates {
    static Original: string;
    static Changed: string;
    static Deleted: string;
    static Error: string;
}

const ConfigCameraDialogTranslations: (pipTranslateProvider: pip.services.ITranslateProvider) => void;
var Webcam: any;
var Camera: any;


export interface ICameraDialogService {
    show(successCallback?: (result) => void, cancelCallback?: () => void): any;
}



export class Attachment {
    constructor(id?: string, uri?: string, name?: string);
    id?: string;
    uri?: string;
    name?: string;
}


export class BlobInfo {
    constructor(id: string, group: string, name: string, size?: number, content_type?: string, create_time?: Date, expire_time?: Date, completed?: boolean);
    id: string;
    group: string;
    name: string;
    size: number;
    content_type: string;
    create_time: Date;
    expire_time: Date;
    completed: boolean;
}

export class DataPage<T> {
    constructor(data?: T[], total?: number);
    total: number;
    data: T[];
}

export class AvatarConfig {
    AvatarRoute: string;
    AvatarResource: string;
    AvatarFieldId: string;
    ShowOnlyNameIcon: boolean;
    DefaultInitial: string;
}
export const colorClasses: string[];
export const colors: string[];
export interface IAvatarDataService {
    AvatarRoute: string;
    ShowOnlyNameIcon: boolean;
    DefaultInitial: string;
    getAvatarUrl(id: any): string;
    postAvatarUrl(): string;
    deleteAvatar(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
    createAvatar(data: any, successCallback?: (data: BlobInfo) => void, errorCallback?: (error: any) => void, progressCallback?: (progress: number) => void): void;
}
export interface IAvatarDataProvider extends ng.IServiceProvider {
    AvatarRoute: string;
    AvatarResource: string;
    DefaultInitial: string;
    ShowOnlyNameIcon: boolean;
    AvatarFieldId: string;
}

export interface IImageSetDataService {
    readImageSets(params: any, successCallback?: (data: DataPage<ImageSet>) => void, errorCallback?: (error: any) => void): ng.IPromise<any>;
    readImageSet(id: string, successCallback?: (data: ImageSet) => void, errorCallback?: (error: any) => void): ng.IPromise<any>;
    updateImageSet(id: string, data: ImageSet, successCallback?: (data: ImageSet) => void, errorCallback?: (error: any) => void): void;
    createImageSet(data: ImageSet, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): void;
    deleteImageSet(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
}

export class Image {
    title: string;
    link: string;
    thumbnail: string;
}

export class ImageSet {
    constructor(id: string, title: string, picIds?: string[], create_time?: Date);
    id: string;
    create_time: Date;
    title: string;
    pics?: Attachment[];
    tags?: string[];
    all_tags?: string[];
}



export class PictureConfig {
    PictureRoute: string;
    DefaultErrorIcon: string;
    ShowErrorIcon: boolean;
}
export interface IPictureDataService {
    PictureRoute: string;
    DefaultErrorIcon: string;
    ShowErrorIcon: boolean;
    getPictureUrl(id: string): string;
    postPictureUrl(): string;
    readPictures(params: any, successCallback?: (data: DataPage<BlobInfo>) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readPictureInfo(params: any, successCallback?: (data: BlobInfo) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readPicture(id: string, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    deletePicture(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
}
export interface IPictureDataProvider extends ng.IServiceProvider {
    PictureRoute: string;
    DefaultErrorIcon: string;
    ShowErrorIcon: boolean;
    getPictureUrl(id: string): string;
}




export class GallerySearchDialogParams {
    multiple: boolean;
}
export interface IGallerySearchDialogService {
    show(params: GallerySearchDialogParams, successCallback?: (result: Attachment[][]) => void, cancelCallback?: () => void): any;
}



export class PictureEditControl {
    reset: (afterDeleting?: boolean) => void;
    save: (successCallback?: (response?: Attachment) => void, errorCallback?: (error?: any) => void) => void;
    abort: () => void;
    error?: any;
    disabled: boolean;
    url: string;
    uriData: any;
    uri: string;
    id: string;
    name: string;
    progress: number;
    uploaded: boolean;
    uploading: boolean;
    upload: boolean;
    loaded: boolean;
    file: any;
    state: string;
}
export class PictureStates {
    static Original: string;
    static Copied: string;
    static Changed: string;
    static Deleted: string;
    static Error: string;
}

export class PictureListEditItem {
    pin: number;
    id: string;
    uri: string;
    name: string;
    url: string;
    uriData: any;
    uploading: boolean;
    uploaded: boolean;
    progress: number;
    file: any;
    upload?: any;
    state: string;
    loaded?: boolean;
}
export class PictureListEditControl {
    uploading: number;
    items: PictureListEditItem[];
    reset: () => void;
    save: (successCallback?: (data?: Attachment[]) => void, errorCallback?: (error?: PictureUploadErrors[]) => void) => void;
    abort: () => void;
    error?: any;
}
export class PictureListEditStates {
    static Added: string;
    static Original: string;
    static Copied: string;
    static Changed: string;
    static Deleted: string;
    static Error: string;
}
export class PictureUploadErrors {
    id: string;
    uri: string;
    name: string;
}


export interface IPictureUrlDialogService {
    show(successCallback?: (result: string) => void, cancelCallback?: () => void): any;
}

const ConfigPictureUrlDialogTranslations: (pipTranslateProvider: pip.services.ITranslateProvider) => void;
class PictureUrlDialogController {
    private $log;
    private $scope;
    private $mdDialog;
    private $rootScope;
    private $timeout;
    private $mdMenu;
    private pipPictureUtils;
    url: string;
    invalid: boolean;
    theme: string;
    constructor($log: ng.ILogService, $scope: ng.IScope, $mdDialog: angular.material.IDialogService, $rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService, $mdMenu: any, pipPictureUtils: any);
    setImageSize(img: any): void;
    checkUrl(): void;
    onCancelClick(): void;
    onAddClick(): void;
}


function configAvatarResources(pipRestProvider: pip.rest.IRestProvider): void;

function configImageSetResources(pipRestProvider: pip.rest.IRestProvider): void;


function configPictureResources(pipRestProvider: pip.rest.IRestProvider): void;


export class imageCssParams {
    'width'?: string;
    'margin-left'?: string;
    'height'?: string;
    'margin-top'?: string;
}
export interface IPictureUtilsService {
    getCollageSchemes(): any;
    setErrorImageCSS(image: any, params?: imageCssParams): void;
    setImageMarginCSS($element: any, image: any, params?: imageCssParams): void;
    setIconMarginCSS(container: any, icon: any): void;
}
export interface IPictureUtilsProvider extends ng.IServiceProvider {
}

export class PicturePaste {
    private $timeout;
    private pasteCatcher;
    constructor($timeout: ng.ITimeoutService);
    addPasteListener(onPaste: any): void;
    removePasteListener(): void;
}


}

declare module pip.documents {


export class Attachment {
    constructor(id?: string, uri?: string, name?: string);
    id?: string;
    uri?: string;
    name?: string;
}

export class BlobInfo {
    constructor(id: string, group: string, name: string, size?: number, content_type?: string, create_time?: Date, expire_time?: Date, completed?: boolean);
    id: string;
    group: string;
    name: string;
    size: number;
    content_type: string;
    create_time: Date;
    expire_time: Date;
    completed: boolean;
}

export class DataPage<T> {
    constructor(data?: T[], total?: number);
    total: number;
    data: T[];
}


export class DocumentConfig {
    DocumentRoute: string;
}
export interface IDocumentDataService {
    DocumentRoute: string;
    getDocumentUrl(id: string): string;
    postDocumentUrl(): string;
    readDocuments(params: any, successCallback?: (data: DataPage<BlobInfo>) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readDocumentInfo(params: any, successCallback?: (data: BlobInfo) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readDocument(id: string, successCallback?: (data: BlobInfo) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    deleteDocument(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
}
export interface IDocumentDataProvider extends ng.IServiceProvider {
    DocumentRoute: string;
}



export let DefaultDocumentIcon: string;
export class DocumentListEditControl {
    uploading: number;
    items: DocumentListEditItem[];
    reset: () => void;
    save: (successCallback?: (data: Attachment[]) => void, errorCallback?: (error: any) => void) => void;
    abort: () => void;
    error?: any;
}
export class DocumentUploadErrors {
    id: string;
    uri: string;
    name: string;
    error: any;
}
export class DocumentListEditItem {
    pin: number;
    id: string;
    name: string;
    uri?: string;
    uploading: boolean;
    uploaded: boolean;
    upload?: any;
    progress: number;
    file: any;
    state: string;
    error: any;
}


export interface IDocumentUrlDialogService {
    show(successCallback?: (result: string) => void, cancelCallback?: () => void): any;
}

function configDocumentResources(pipRestProvider: pip.rest.IRestProvider): void;

function configFileResources(pipRestProvider: pip.rest.IRestProvider): void;


}

declare module pip.composite {

export const ChecklistDraggEvent: string;


export const CompositeEmptyEvent: string;
export const CompositeAddItemEvent: string;
export const CompositeNotEmptyEvent: string;
export class CompositeAddItem {
    id: number;
    type: string;
}
export class CompositeControl {
    save: (successCallback?: (data: CompositeContent[]) => void, errorCallback?: (error: any) => void) => void;
    abort: () => void;
    error?: any;
}
export class CompositeContent extends ContentBlock {
    empty?: boolean;
    documents?: pip.documents.DocumentListEditControl;
    pictures?: pip.pictures.PictureListEditControl;
}
export class CompositeBlockTypes {
    static Text: string;
    static Pictures: string;
    static Checklist: string;
    static Documents: string;
    static Location: string;
    static Time: string;
    static SecondaryBlock: string[];
    static PrimaryBlock: string[];
    static All: string[];
}


export class CompositeAddItemEventParams {
    type: string;
    id: string;
}
export class CompositeToolbarButton {
    picture: boolean;
    document: boolean;
    location: boolean;
    event: boolean;
    checklist: boolean;
    text: boolean;
}



export class ChecklistItem {
    checked: boolean;
    text: string;
    empty?: boolean;
}

export class ContentBlock {
    id?: number;
    type: string;
    text?: string;
    docs?: pip.documents.Attachment[];
    picIds?: pip.documents.Attachment[];
    pic_ids?: string[];
    loc_pos?: any;
    loc_name?: string;
    start?: string;
    end?: string;
    all_day?: boolean;
    checklist?: ChecklistItem[];
    embed_type?: string;
    embed_uri?: string;
    custom?: any;
}

export class ContentBlockType {
    static readonly Text: string;
    static readonly Checklist: string;
    static readonly Location: string;
    static readonly Time: string;
    static readonly Pictures: string;
    static readonly Documents: string;
    static readonly Embedded: string;
    static readonly Custom: string;
}

export class EmbeddedType {
    static readonly Youtube: string;
    static readonly Custom: string;
}







export const CompositeFocusedEvent: string;

}

declare module pip.guidance {

export class Attachment {
    id?: string;
    uri?: string;
    name?: string;
}

export class Guide {
    id: string;
    name?: string;
    type: string;
    app?: string;
    min_ver?: number;
    max_ver?: number;
    create_time: Date;
    pages: GuidePage[];
    tags?: string[];
    all_tags?: string[];
    status?: string;
    custom_hdr?: any;
    custom_dat?: any;
}


export class GuidePage {
    title: MultiString;
    content?: MultiString;
    more_url?: string;
    color?: string;
    pic_id?: string;
    pic_uri?: string;
}

export class GuideStatus {
    static readonly New: string;
    static readonly Writing: string;
    static readonly Translating: string;
    static readonly Verifying: string;
    static readonly Completed: string;
}

export class GuideType {
    static readonly Introduction: string;
    static readonly NewRelease: string;
}

export interface IGuideDataService {
    readGuides(params: any, successCallback?: (data: PageData) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readRandomGuide(params: any, successCallback?: (data: Guide) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readIntroGuides(params: any, successCallback?: (data: PageData) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readGuide(id: string, successCallback?: (data: Guide) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    createGuide(data: Guide, successCallback?: (data: Guide) => void, errorCallback?: (error: any) => void): void;
    updateGuide(id: string, data: Guide, successCallback?: (data: Guide) => void, errorCallback?: (error: any) => void): void;
    deleteGuide(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
}


export interface IQuoteDataService {
    readQuotes(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readRandomQuote(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readQuote(id: string, successCallback?: (data: Quote) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    createQuote(data: Quote, successCallback?: (data: Quote) => void, errorCallback?: (error: any) => void): void;
    updateQuote(id: string, data: Quote, successCallback?: (data: Quote) => void, errorCallback?: (error: any) => void): void;
    deleteQuote(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
}

export interface ITipDataService {
    readTips(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readRandomTip(params: any, successCallback?: (data: any) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readTip(id: string, successCallback?: (data: Tip) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    createTip(data: Tip, successCallback?: (data: Tip) => void, errorCallback?: (error: any) => void): void;
    updateTip(id: string, data: Tip, successCallback?: (data: Tip) => void, errorCallback?: (error: any) => void): void;
    deleteTip(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
}

export class MultiString {
    [language: string]: string;
}

export class PageData {
    data: any[];
    total: number;
}

export class PartyReference {
    id: string;
    name?: string;
    email?: string;
}

export class Quote {
    id: string;
    text: MultiString;
    author: MultiString;
    status: string;
    tags: string[];
    all_tags: string[];
}


export class QuoteStatus {
    static readonly New: string;
    static readonly Writing: string;
    static readonly Translating: string;
    static readonly Verifying: string;
    static readonly Completed: string;
}

export class Tip {
    id: string;
    topics: string[];
    creator: PartyReference;
    create_time: Date;
    title?: MultiString;
    content?: MultiString;
    more_url?: string;
    pics?: Attachment[];
    docs?: Attachment[];
    tags?: string[];
    all_tags?: string[];
    status?: string;
    custom_hdr?: any;
    custom_dat?: any;
}


export class TipStatus {
    static readonly New: string;
    static readonly Writing: string;
    static readonly Translating: string;
    static readonly Verifying: string;
    static readonly Completed: string;
}


export interface IIntroGuidanceService {
    showReleaseGuidance(filter: string, successCallback?: () => void, errorCallback?: () => void): void;
    showIntroGuidance(filter: string, successCallback?: () => void, errorCallback?: () => void): void;
    showGuide(guide: Guide, ln: string, successCallback?: () => void, errorCallback?: () => void): void;
    findIntroReleaseGuide(guides: Guide[], settings: any, appName: string): Guide;
}




export interface IQuotesService {
    filterQuotes(data: any[], topic: string): any[];
    showQuotes(quotes: any[], ln: string, $event?: any): void;
    waitUserTipsQuotes(tips: any[], quotes: any[], ln: string): void;
}


function pipGuideDataConfig(pipRestProvider: pip.rest.IRestProvider): void;


function configQuoteResources(pipRestProvider: pip.rest.IRestProvider): void;

function pipTipDataConfig(pipRestProvider: pip.rest.IRestProvider): void;

export interface ITipsService {
    filterTips(data: any[], topic: string): any[];
    showTips(tips: any[], ln: string, $event?: any): void;
    firstShowTips(tips: any[], language: string, topic: string, settings: any, dayC: number): void;
    getTips(party: any, ln: string, topic: string, callback?: (...args) => void): any;
}


}

declare module pip.support {


export interface IAnalyticsProvider extends ng.IServiceProvider {
    enabled: boolean;
    trackingId: string;
    window: any;
    enable(newTrackingId: string): boolean;
    pageView(url: string, user: any, language: string): any;
    event(category: string, action: string, value: string, user: any, language: string): any;
}

export class Attachment {
    constructor(id?: string, uri?: string, name?: string);
    id?: string;
    uri?: string;
    name?: string;
}

export class Feedback {
    constructor(id: string, category: string, app?: string, sender?: PartyReference, title?: string, content?: string, sent_time?: Date);
    id: string;
    category: string;
    app?: string;
    sender: PartyReference;
    sent_time: Date;
    title?: string;
    content?: string;
    pics: Attachment[];
    docs: Attachment[];
    company_name?: string;
    company_addr?: string;
    copyright_holder?: string;
    original_loc?: string;
    copyrighted_work?: string;
    unauth_loc?: string;
    reply_time?: Date;
    replier?: PartyReference;
    reply?: string;
    custom_hdr?: any;
    custom_dat?: any;
}


export interface IFeedbackDataService {
    readFeedbacks(params: any, successCallback?: (data: PageData) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    readFeedback(id: string, successCallback?: (data: Feedback) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    createFeedback(data: Feedback, successCallback?: (data: Feedback) => void, errorCallback?: (error: any) => void): void;
    updateFeedback(id: string, data: Feedback, successCallback?: (data: Feedback) => void, errorCallback?: (error: any) => void): void;
    deleteFeedback(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
}


export class PageData {
    data: any[];
    total: number;
}

export class PartyReference {
    constructor(id: string, name?: string, email?: string);
    id: string;
    name?: string;
    email?: string;
}

class FeedbackController {
    private pipToasts;
    private pipTranslate;
    data: any;
    contentSwitchOption: {
        picture: boolean;
        document: boolean;
        location: boolean;
        event: boolean;
    };
    $panel: any;
    callback: Function;
    constructor($rootScope: ng.IRootScopeService, $state: ng.ui.IStateService, pipAppBar: pip.nav.IAppBarService, pipToasts: pip.controls.IToastService, pipTranslate: pip.services.ITranslateService);
    showAppBar(): void;
    onSave(): void;
    onTypeChange(): void;
    saveCallback(): void;
}


interface IFeedbackPanelBindings {
    [key: string]: any;
    data: any;
    created: any;
    showPictures: any;
    showDocuments: any;
    typeCollection: any;
    saveCallback: any;
}
const FeedbackPanelBindings: IFeedbackPanelBindings;
class FeedbackPanelChanges implements ng.IOnChangesObject, IFeedbackPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    data: ng.IChangesObject<FeedbackPanelEntity>;
    created: ng.IChangesObject<any>;
    showPictures: ng.IChangesObject<boolean>;
    showDocuments: ng.IChangesObject<boolean>;
    typeCollection: ng.IChangesObject<FeedbackPanelTypeCollection[]>;
    saveCallback: ng.IChangesObject<Function>;
}
class FeedbackPanelEntity {
    sender_id: string;
    sender_name: string;
    sender_email: string;
    pic_ids: any[];
    docs: any[];
    type: string;
    signature?: string;
    request_conc?: boolean;
    copyright_conc?: boolean;
    unauth_loc?: string;
    copyrighted_work?: string;
    original_loc?: string;
    copyright_holder?: string;
    company_addr?: string;
    company_name?: string;
    content?: string;
    title?: string;
}
class FeedbackPanelTypeCollection {
    id: string;
    name: string;
}
class FeedbackPanelController {
    private pipFeedbackData;
    form: any;
    typeCollection: FeedbackPanelTypeCollection[];
    type: string;
    data: FeedbackPanelEntity;
    showPictures: boolean;
    showDocuments: boolean;
    saveCallback: Function;
    $control: any;
    typeIndex: number;
    pictures: any[];
    docs: any[];
    errorsWithHint: Function;
    $party: any;
    created: any;
    constructor($rootScope: ng.IRootScopeService, pipFeedbackData: any, pipTranslate: pip.services.ITranslateService, pipFormErrors: any);
    onSave(): void;
    onTypeChange(type: FeedbackPanelTypeCollection): void;
}


export interface IFeedbackDialogService {
    show(params: any, successCallback?: (answer) => void, cancelCallback?: () => void): void;
}


function pipFeedbackDataConfig(pipRestProvider: pip.rest.IRestProvider): void;


}

declare module pip.maps {

let google: any;






interface IMapEditBindings {
    [key: string]: any;
    overlay: any;
    onEdit: any;
    mapOptions: any;
    showActionPanel: any;
    actionTypes: any;
    control: any;
    disabled: any;
}
const MapEditBindings: IMapEditBindings;
class actionTypes {
    static clearMap: string;
    static addCircle: string;
    static addRectangle: string;
    static addPolygon: string;
    static addLine: string;
}
class MapEditChanges implements ng.IOnChangesObject, IMapEditBindings {
    [key: string]: ng.IChangesObject<any>;
    overlay: ng.IChangesObject<any>;
    mapOptions: ng.IChangesObject<any>;
    showActionPanel: ng.IChangesObject<boolean>;
    actionTypes: ng.IChangesObject<any>;
    disabled: ng.IChangesObject<boolean>;
    control: any;
    onEdit: any;
}
class MapEditController {
    private $element;
    private $scope;
    private $mdConstant;
    private $document;
    private $timeout;
    private uiGmapGoogleMapApi;
    map: {
        control: {};
        options: {
            disableDefaultUI: boolean;
            mapTypeId: string;
            panControl: boolean;
            zoomControl: boolean;
            mapTypeControl: boolean;
            streetViewControl: boolean;
        };
    };
    drawingManagerControl: any;
    drawingManagerOptions: any;
    currentOverlay: any;
    actionTypes: any[];
    showActionPanel: boolean;
    overlay: any;
    mapOptions: any;
    onEdit: Function;
    control: Function;
    disabled: boolean;
    private _circleOptions;
    private _polygonOptions;
    private _polylineOptions;
    private _markerOptions;
    private _rectangleOptions;
    constructor($element: JQuery, $scope: ng.IScope, $mdConstant: any, $document: ng.IDocumentService, $timeout: ng.ITimeoutService, uiGmapGoogleMapApi: any);
    $onDestroy(): void;
    $onChanges(changes: MapEditChanges): void;
    $onInit(): void;
    private fitBounds();
    private convertToGoogleMapOverlay(overlay);
    private createMarker(overlay);
    private createCircle(overlay);
    private createPolygon(overlay);
    private createPolyline(overlay);
    private createRectangle(overlay);
    private getOptionsByType(type);
    private getDisableOptions();
    private setOverlay(overlay, type, fitBounds?);
    private onEditOverlay();
    showAction(action: any): boolean;
    readonly showPanel: boolean;
    addCircle(): void;
    addPolygon(): void;
    addRectangle(): void;
    addLine(): void;
    addMarker(): void;
    clearMap(): void;
}
let config: (uiGmapGoogleMapApiProvider: any) => void;






























}

declare module pip.tags {


export interface ITagDataService {
    getUserId(): string;
    readTags(params: any, successCallback?: (data: PartyTags) => void, errorCallback?: (error: any) => void): angular.IPromise<any>;
    createTags(params: any, successCallback?: (item: any) => void, errorCallback?: (error: any) => void): void;
    updateTags(params: any, successCallback?: (item: any) => void, errorCallback?: (error: any) => void): void;
}
export interface ITagDataProvider extends ng.IServiceProvider {
}

export class PartyTags {
    id: string;
    tags: Tag[];
    change_time: string;
}

export class Tag {
    tag: string;
    count: number;
    last_time: Date;
}


function configTagResources(pipRestProvider: pip.rest.IRestProvider): void;


}
