'use strict';

module App.Services {

    export interface IEntityObjectId {
        Id: string;
    }

    export interface ICRUDService<T extends IEntityObjectId> {
        /**
        .* Получение объекта по его Id с сервера.
         * @param id идентификатор объекта
         */
        Load(id: string): IPromise<T>;
        /**
        .* Получение списка объектов с сервера.
         * @param query параметры запроса
         */
        Load(query?: ODataParams | IODataParams): IPromise<T[]>;
        /**
         * Сохранение объекта.
         * После успешного сохранения объекта, переданного в фунцию Save от сервера приходит объект,
         * соответствующий текущему состоянию на сервере после сохранения (например, с запоненными полями Id, Number и т.д.)
         * По умолчанию эти значения копируются в исходный объект (переданный в метод Save).
         * В параметры можно передать метод, который будет дополнительно вызван после стандартной обработки ответа.
         * @param entity сохраняемый объект
         * @param afterSave действие выполняемое после сохранения
         */
        Save(entity: T): IPromise<T>;
        /**
         * Удаляет объект из базы данных по его Id.
         * @param id Идентификатор объекта.
         */
        Delete(id: string): IPromise<boolean>;
    }

    /**
     * Базовый класс для всех прикладных сервисов.
     */
    export class CRUDService<T extends IEntityObjectId> extends Service implements ICRUDService<T> {

        /**
         * Ресурс для работы с бекэндом сервиса.
         * Можно перекрыть в классе наследнике.
        */
        protected apiService: IResourceClass<T>;

        /**
         * Возвращает ресурс для работы с бекэндом сервиса.
         * По умолчанию, если ничего не делать в классах наследниках если они названы согласно Styleguid'у - Nv<ИмяКласса>Service
         * будет пытаться взять из поля app.Api.<ИмяКласса>.
         */
        get ApiService(): IResourceClass<T> {

            if (!this.apiService) {
                var serviceName = this.ngName;
                if (serviceName.EndsWith("Service"))
                    serviceName = serviceName.substr(0, serviceName.length - "Service".length);
                if (app.api[serviceName])
                    this.apiService = app.api[serviceName];
                else if (serviceName.StartsWith("nv", true)) {
                    serviceName = serviceName.substr(2, serviceName.length - 2);
                    this.apiService = app.api[serviceName];
                }
                if (!this.apiService) {
                    throw new Error("Необходимо задать значение поля apiService или реализовать метод getApiService в классе наследнике от CRUDService.");
                }
            }
            return this.apiService;
        }

        /**
         * Этот метод вызывается ПЕРЕД отправкой запроса query на сервер.
         * Перекрыв его в классе наследнике можно глобально влиять на запросы к бекенду данного класса.
         * @param odata параметры запроса
         */
        protected prepareQuery(odata: ODataParams) {
            
        }

        /**
         * Этот метод вызывается ПЕРЕД отправкой запроса query на сервер.
         * Перекрыв его в классе наследнике можно глобально влиять на пришедший ответ.
         * Например, изменить поведение по умолчанию, когда в случае ошибки - она выводится на экран.
         * @param query промис запроса
         */
        protected afterQuery(query: IPromise<T[]>): IPromise<T[]> {
            return query.HandleError();
        }

        /**
         * Этот метод вызывается ПЕРЕД отправкой запроса get на сервер.
         * Перекрыв его в классе наследнике можно глобально влиять на пришедший ответ.
         * Например, изменить поведение по умолчанию, когда в случае ошибки - она НЕ выводится на экран.
         * @param query промис запроса
         */
        protected afterGet(query: IPromise<T>): IPromise<T> {
            return query;
        }

        /**
         * Этот метод вызывается ПОСЛЕ получения объекта или объектов с сервера.
         * Перекрыв его в классе наследнике можно глобально влиять на получение результатов.
         * Например, заполнить вычислимые поля или поля, которые как-то зависят от текущего состояния объекта.
         * По умолчанию этот метод вызывается при получении результатов методами Load ($query, $get) и Save (результат сохранения).
         * Если вы пишете свои дополнительные методы, которые получают объекты класса напрямую через apiServive - 
         * вызывайте этот метод при получении результата.
         * @param res объект - результат запроса.
         */
        protected prepareResult(res: T): void {
        }


        /**
         * Этот метод вызывается ПЕРЕД сохранением объекта.
         * Перекрыв его в классе наследнике можно глобально влиять на сохранение объектов.
         * Например, очищать ссылочные поля, которые в принципе не требуются при сохранении, 
         * но увеличивают рамер передаваемых данных и могут привести к циклическим ссылкам.
         */
        protected prepareSave(entity: T): void {
        }

        /**
         * Этот метод вызывается ПОСЛЕ сохранения объекта.
         * Перекрыв его в классе наследнике можно глобально влиять на действия после сохранения объектов.
         * После успешного сохранения объекта, переданного в фунцию Save от сервера приходит объект,
         * соответствующий текущему состоянию на сервере после сохранения (например, с запоненными полями Id, Number и т.д.)
         * По умолчанию эти значения копируются в исходный объект (переданный в метод Save) как раз при помощи этого метода.
         * Данный метод также влияет на то, какой объект будет возвращён в качестве результата промиса Save.
         * По умолчанию - это объект, пришедший с сервера (не исходный).
         */
        protected afterSave(res: T, source: T, wasNew: boolean): T {
            // Копируем все поля, кроме ссылочных, если они равны null
            for (let key in res) {
                if (res.hasOwnProperty(key)) {
                    if (key[0] === "$") continue;
                    const priorValue = source[key];
                    const value = res[key];
                    if (typeof priorValue !== "object" || value)
                        source[key] = res[key];
                }
            }
            return res;
        }

        /**
        .* Получение списка объектов с сервера.
         * @param query параметры запроса
         */
        protected $query(query?: ODataParams | IODataParams): IPromise<T[]> {
            var odata = query instanceof ODataParams ? query : new ODataParams(<IODataParams>query);
            this.prepareQuery(odata);
            var res = this.afterQuery(this.ApiService.query(odata));
            if (!this.prepareResult.isEmpty()) {
                res = res.then(r => {
                    if (angular.isArray(r))
                        r.forEach((x: any) => this.prepareResult(x));
                    return r;
                });
            }
            return res;
        }

        /**
        .* Получение объекта по его Id с сервера.
         * @param id идентификатор объекта
         */
        protected $get(id: string): IPromise<T> {
            var res = this.afterGet(this.ApiService.get(id));
            if (!this.prepareResult.isEmpty()) {
                res = res.then((r: any) => {
                    if (r)
                        this.prepareResult(r);
                    return r;
                });
            }
            return res;
        }


        /**
        .* Получение объекта по его Id с сервера.
         * @param id идентификатор объекта
         */
        Load(id: string): IPromise<T>;
        /**
        .* Получение списка объектов с сервера.
         * @param query параметры запроса
         */
        Load(query?: ODataParams | IODataParams): IPromise<T[]>;
        Load(p): any {
            if (angular.isString(p))
                return this.$get(p);
            else
                return this.$query(p);
        }

        /**
         * Сохранение объекта.
         * После успешного сохранения объекта, переданного в фунцию Save от сервера приходит объект,
         * соответствующий текущему состоянию на сервере после сохранения (например, с запоненными полями Id, Number и т.д.)
         * По умолчанию эти значения копируются в исходный объект (переданный в метод Save).
         * В параметры можно передать метод, который будет дополнительно вызван после стандартной обработки ответа.
         * @param entity сохраняемый объект
         * @param afterSave действие выполняемое после сохранения
         */
        Save(entity: T, afterSave?: (res: T, source?: T, wasNew?: boolean) => T | void): IPromise<T> {
            var isNew = !entity.Id;
            var savedEntity = angular.copy(<any>entity);
            this.prepareSave(savedEntity);
            var savePromise = isNew ? this.ApiService.create(savedEntity) : this.ApiService.update(savedEntity);
            return savePromise.HandleError().then((res: any) => {
                var result = this.Update(entity, res);
                if (afterSave)
                    result = <any>afterSave(res, entity, isNew) || result;
                return result;
            });
        }

        /**
         * Производит обновление текущих данных объекта данными нового объекта.
         * Обновление происходит по глобальным правилам, заданным в сервисе.
         * @param destination целевой объект, данные которого нужно обновить
         * @param source объект, данными которого обновляют целевой объект.
         */
        Update(destination: T, source: T): T;
        /**
         * Производит обновление текущих данных объекта данными с сервиса.
         * Обновление происходит по глобальным правилам, заданным в сервисе.
         * Целевой объект получит обновлённые данные по Id.
         * @param destination целевой объект, данные которого нужно обновить
         */
        Update(destination: T): IPromise<T>;
        Update(p1, p2?: T) {
            var destination = p1;
            var source = p2;
            var isNew = !destination.Id;
            if (!isNew && !source) {
                return this.Load(destination.Id).then(r => this.Update(destination, <any>r));
            } else if (source) {
                destination.Id = source.Id;
                this.prepareResult(destination);
                return this.afterSave(source, destination, isNew) || destination;
            }
            return destination;
        }

        /**
         * Удаляет объект из базы данных по его Id.
         * @param id Идентификатор объекта.
         */
        Delete(id: string): IPromise<boolean> {
            return this.ApiService.delete(id).HandleError();
        }

    }

}