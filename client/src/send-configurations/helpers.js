'use strict';

import React from "react";

import {MailerType} from "../../../shared/send-configurations";
import {
    CheckBox,
    Dropdown,
    Fieldset,
    InputField,
    TextArea
} from "../lib/form";
import {Trans} from "react-i18next";

export const mailerTypesOrder = [
    MailerType.ZONE_MTA,
    MailerType.GENERIC_SMTP,
    MailerType.AWS_SES
];

export function getMailerTypes(t) {
    const mailerTypes = {};

    function initFieldsIfMissing(mutState, mailerType) {
        const initVals = mailerTypes[mailerType].initData();

        for (const key in initVals) {
            if (!mutState.hasIn([key])) {
                mutState.setIn([key, 'value'], initVals[key]);
            }
        }
    }

    function clearBeforeSave(data) {
        for (const mailerKey in mailerTypes) {
            const initVals = mailerTypes[mailerKey].initData();
            for (const fieldKey in initVals) {
                delete data[fieldKey];
            }
        }
    }

    function validateNumber(state, field, label, emptyAllowed = false) {
        const value = state.getIn([field, 'value']);
        if (typeof value === 'string' && value.trim() === '' && !emptyAllowed) { // After load, the numerical values can be still numbers
            state.setIn([field, 'error'], t('labelMustNotBeEmpty', {label}));
        } else if (isNaN(value)) {
            state.setIn([field, 'error'], t('labelMustBeANumber', {label}));
        } else {
            state.setIn([field, 'error'], null);
        }
    }

    function getInitCommon() {
        return {
            maxConnections: '5',
            throttling: '',
            logTransactions: false
        };
    }

    function getInitGenericSMTP() {
        return {
            ...getInitCommon(),
            smtpHostname: '',
            smtpPort: '',
            smtpEncryption: 'NONE',
            smtpUseAuth: false,
            smtpUser: '',
            smtpPassword: '',
            smtpAllowSelfSigned: false,
            smtpMaxMessages: '100'
        };
    }

    function afterLoadCommon(data) {
        data.maxConnections = data.mailer_settings.maxConnections;
        data.throttling = data.mailer_settings.throttling || '';
        data.logTransactions = data.mailer_settings.logTransactions;
    }

    function afterLoadGenericSMTP(data) {
        afterLoadCommon(data);
        data.smtpHostname = data.mailer_settings.hostname;
        data.smtpPort = data.mailer_settings.port || '';
        data.smtpEncryption = data.mailer_settings.encryption;
        data.smtpUseAuth = data.mailer_settings.useAuth;
        data.smtpUser = data.mailer_settings.user;
        data.smtpPassword = data.mailer_settings.password;
        data.smtpAllowSelfSigned = data.mailer_settings.allowSelfSigned;
        data.smtpMaxMessages = data.mailer_settings.maxMessages;
    }

    function beforeSaveCommon(data) {
        data.mailer_settings = {};
        data.mailer_settings.maxConnections = Number(data.maxConnections);
        data.mailer_settings.throttling = Number(data.throttling);
        data.mailer_settings.logTransactions = data.logTransactions;
    }

    function beforeSaveGenericSMTP(data) {
        beforeSaveCommon(data);
        data.mailer_settings.hostname = data.smtpHostname;
        data.mailer_settings.port = Number(data.smtpPort);
        data.mailer_settings.encryption = data.smtpEncryption;
        data.mailer_settings.useAuth = data.smtpUseAuth;
        data.mailer_settings.user = data.smtpUser;
        data.mailer_settings.password = data.smtpPassword;
        data.mailer_settings.allowSelfSigned = data.smtpAllowSelfSigned;
        data.mailer_settings.maxMessages = Number(data.smtpMaxMessages);
    }

    function validateCommon(state) {
        validateNumber(state, 'maxConnections', 'Max connections');
        validateNumber(state, 'throttling', 'Throttling', true);
    }

    function validateGenericSMTP(state) {
        validateCommon(state);
        validateNumber(state, 'smtpPort', 'Port', true);
        validateNumber(state, 'smtpMaxMessages', 'Max messages');
    }

    const typeOptions = [
        { key: MailerType.GENERIC_SMTP, label: t('genericSmtp')},
        { key: MailerType.ZONE_MTA, label: t('zoneMta')},
        { key: MailerType.AWS_SES, label: t('amazonSes')}
    ];

    const smtpEncryptionOptions = [
        { key: 'NONE', label: t('doNotUseEncryption')},
        { key: 'TLS', label: t('useTls –UsuallySelectedForPort465')},
        { key: 'STARTTLS', label: t('useStarttls –UsuallySelectedForPort587')}
    ];

    const sesRegionOptions = [
        { key: 'us-east-1', label: t('useast1')},
        { key: 'us-west-2', label: t('uswest2')},
        { key: 'eu-west-1', label: t('euwest1')}
    ];

    mailerTypes[MailerType.GENERIC_SMTP] = {
        getForm: owner =>
            <div>
                <Fieldset label={t('mailerSettings')}>
                    <Dropdown id="mailer_type" label={t('mailerType')} options={typeOptions}/>
                    <InputField id="smtpHostname" label={t('hostname')} placeholder={t('hostnameEgSmtpexamplecom')}/>
                    <InputField id="smtpPort" label={t('port')} placeholder={t('portEg465AutodetectedIfLeftBlank')}/>
                    <Dropdown id="smtpEncryption" label={t('encryption')} options={smtpEncryptionOptions}/>
                    <CheckBox id="smtpUseAuth" text={t('enableSmtpAuthentication')}/>
                    { owner.getFormValue('smtpUseAuth') &&
                    <div>
                        <InputField id="smtpUser" label={t('username')} placeholder={t('usernameEgMyaccount@examplecom')}/>
                        <InputField id="smtpPassword" label={t('password')} placeholder={t('usernameEgMyaccount@examplecom')}/>
                    </div>
                    }
                </Fieldset>
                <Fieldset label={t('advancedMailerSettings')}>
                    <CheckBox id="logTransactions" text={t('logSmtpTransactions')}/>
                    <CheckBox id="smtpAllowSelfSigned" text={t('allowSelfsignedCertificates')}/>
                    <InputField id="maxConnections" label={t('maxConnections')} placeholder={t('theCountOfMaxConnectionsEg10')} help={t('theCountOfMaximumSimultaneousConnections')}/>
                    <InputField id="smtpMaxMessages" label={t('maxMessages')} placeholder={t('theCountOfMaxMessagesEg100')} help={t('theNumberOfMessagesToSendThroughASingle')}/>
                    <InputField id="throttling" label={t('throttling')} placeholder={t('messagesPerHourEg1000')} help={t('maximumNumberOfMessagesToSendInAnHour')}/>
                </Fieldset>
            </div>,
        initData: () => ({
            ...getInitGenericSMTP()
        }),
        afterLoad: data => {
            afterLoadGenericSMTP(data);
        },
        beforeSave: data => {
            beforeSaveGenericSMTP(data);
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, MailerType.GENERIC_SMTP);
        },
        validate: state => {
            validateGenericSMTP(state);
        }
    };

    mailerTypes[MailerType.ZONE_MTA] = {
        getForm: owner =>
            <div>
                <Fieldset label={t('mailerSettings')}>
                    <Dropdown id="mailer_type" label={t('mailerType')} options={typeOptions}/>
                    <InputField id="smtpHostname" label={t('hostname')} placeholder={t('hostnameEgSmtpexamplecom')}/>
                    <InputField id="smtpPort" label={t('port')} placeholder={t('portEg465AutodetectedIfLeftBlank')}/>
                    <Dropdown id="smtpEncryption" label={t('encryption')} options={smtpEncryptionOptions}/>
                    <CheckBox id="smtpUseAuth" text={t('enableSmtpAuthentication')}/>
                    { owner.getFormValue('smtpUseAuth') &&
                    <div>
                        <InputField id="smtpUser" label={t('username')} placeholder={t('usernameEgMyaccount@examplecom')}/>
                        <InputField id="smtpPassword" label={t('password')} placeholder={t('usernameEgMyaccount@examplecom')}/>
                    </div>
                    }
                </Fieldset>
                <Fieldset label={t('dkimSigning')}>
                    <Trans i18nKey="ifYouAreUsingZoneMtaThenMailtrainCan"><p>If you are using ZoneMTA then Mailtrain can provide a DKIM key for signing all outgoing messages. Other services usually provide their own means to DKIM sign your messages.</p></Trans>
                    <Trans i18nKey="doNotUseSensitiveKeysHereThePrivateKeyIs"><p className="text-warning">Do not use sensitive keys here. The private key is not encrypted in the database.</p></Trans>
                    <InputField id="dkimApiKey" label={t('zoneMtaDkimApiKey')} help={t('secretValueKnownToZoneMtaForRequesting')}/>
                    <InputField id="dkimDomain" label={t('dkimDomain')} help={t('leaveBlankToUseTheSenderEmailAddress')}/>
                    <InputField id="dkimSelector" label={t('dkimKeySelector')} help={t('signingIsDisabledWithoutAValidSelector')}/>
                    <TextArea id="dkimPrivateKey" label={t('dkimPrivateKey')} placeholder={t('beginsWithBeginRsaPrivateKey')} help={t('signingIsDisabledWithoutAValidPrivateKey')}/>
                </Fieldset>
                <Fieldset label={t('advancedMailerSettings')}>
                    <CheckBox id="logTransactions" text={t('logSmtpTransactions')}/>
                    <CheckBox id="smtpAllowSelfSigned" text={t('allowSelfsignedCertificates')}/>
                    <InputField id="maxConnections" label={t('maxConnections')} placeholder={t('theCountOfMaxConnectionsEg10')} help={t('theCountOfMaximumSimultaneousConnections')}/>
                    <InputField id="smtpMaxMessages" label={t('maxMessages')} placeholder={t('theCountOfMaxMessagesEg100')} help={t('theNumberOfMessagesToSendThroughASingle')}/>
                    <InputField id="throttling" label={t('throttling')} placeholder={t('messagesPerHourEg1000')} help={t('maximumNumberOfMessagesToSendInAnHour')}/>
                </Fieldset>
            </div>,
        initData: () => ({
            ...getInitGenericSMTP(),
            dkimApiKey: '',
            dkimDomain: '',
            dkimSelector: '',
            dkimPrivateKey: ''
        }),
        afterLoad: data => {
            afterLoadGenericSMTP(data);
            data.dkimApiKey = data.mailer_settings.dkimApiKey;
            data.dkimDomain = data.mailer_settings.dkimDomain;
            data.dkimSelector = data.mailer_settings.dkimSelector;
            data.dkimPrivateKey = data.mailer_settings.dkimPrivateKey;
        },
        beforeSave: data => {
            beforeSaveGenericSMTP(data);
            data.mailer_settings.dkimApiKey = data.dkimApiKey;
            data.mailer_settings.dkimDomain = data.dkimDomain;
            data.mailer_settings.dkimSelector = data.dkimSelector;
            data.mailer_settings.dkimPrivateKey = data.dkimPrivateKey;
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, MailerType.ZONE_MTA);
        },
        validate: state => {
            validateGenericSMTP(state);
        }
    };

    mailerTypes[MailerType.AWS_SES] = {
        getForm: owner =>
            <div>
                <Fieldset label={t('mailerSettings')}>
                    <Dropdown id="mailer_type" label={t('mailerType')} options={typeOptions}/>
                    <InputField id="sesKey" label={t('accessKey')} placeholder={t('awsAccessKeyId')}/>
                    <InputField id="sesSecret" label={t('port')} placeholder={t('awsSecretAccessKey')}/>
                    <Dropdown id="sesRegion" label={t('region')} options={sesRegionOptions}/>
                </Fieldset>
                <Fieldset label={t('advancedMailerSettings')}>
                    <CheckBox id="logTransactions" text={t('logSmtpTransactions')}/>
                    <InputField id="maxConnections" label={t('maxConnections')} placeholder={t('theCountOfMaxConnectionsEg10')} help={t('theCountOfMaximumSimultaneousConnections')}/>
                    <InputField id="throttling" label={t('throttling')} placeholder={t('messagesPerHourEg1000')} help={t('maximumNumberOfMessagesToSendInAnHour')}/>
                </Fieldset>
            </div>,
        initData: () => ({
            ...getInitCommon(),
            sesKey: '',
            sesSecret: '',
            sesRegion: ''
        }),
        afterLoad: data => {
            afterLoadCommon(data);
            data.sesKey = data.mailer_settings.key;
            data.sesSecret = data.mailer_settings.secret;
            data.sesRegion = data.mailer_settings.region;
        },
        beforeSave: data => {
            beforeSaveCommon(data);
            data.mailer_settings.key = data.sesKey;
            data.mailer_settings.secret = data.sesSecret;
            data.mailer_settings.region = data.sesRegion;
            clearBeforeSave(data);
        },
        afterTypeChange: mutState => {
            initFieldsIfMissing(mutState, MailerType.AWS_SES);
        },
        validate: state => {
            validateCommon(state);
        }
    };

    return mailerTypes;
}