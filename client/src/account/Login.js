'use strict';

import React, { Component } from 'react';
import { withTranslation } from '../lib/i18n';
import { withPageHelpers, Title } from '../lib/page'
import { Link } from 'react-router-dom'
import {
    withForm, Form, FormSendMethod, InputField, CheckBox, ButtonRow, Button, AlignedRow
} from '../lib/form';
import { withErrorHandling } from '../lib/error-handling';
import qs from 'querystringify';
import interoperableErrors from '../../../shared/interoperable-errors';
import mailtrainConfig from 'mailtrainConfig';
import {getUrl} from "../lib/urls";

@withTranslation()
@withForm
@withPageHelpers
@withErrorHandling
export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.initForm();
    }

    componentDidMount() {
        this.populateFormValues({
            username: '',
            password: '',
            remember: false
        });
    }

    localValidateFormValues(state) {
        const t = this.props.t;

        const username = state.getIn(['username', 'value']);
        if (!username) {
            state.setIn(['username', 'error'], t('userNameMustNotBeEmpty'));
        } else {
            state.setIn(['username', 'error'], null);
        }

        const password = state.getIn(['password', 'value']);
        if (!username) {
            state.setIn(['password', 'error'], t('passwordMustNotBeEmpty'));
        } else {
            state.setIn(['password', 'error'], null);
        }
    }

    async submitHandler() {
        const t = this.props.t;

        try {
            this.disableForm();
            this.setFormStatusMessage('info', t('verifyingCredentials'));

            const submitSuccessful = await this.validateAndSendFormValuesToURL(FormSendMethod.POST, 'rest/login');

            if (submitSuccessful) {
                const nextUrl = qs.parse(this.props.location.search).next || getUrl();

                /* This ensures we get config for the authenticated user */
                window.location = nextUrl;
            } else {
                this.setFormStatusMessage('warning', t('pleaseEnterYourCredentialsAndTryAgain'));
            }
        } catch (error) {
            if (error instanceof interoperableErrors.IncorrectPasswordError) {
                this.enableForm();

                this.setFormStatusMessage('danger',
                    <span>
                        <strong>{t('invalidUsernameOrPassword')}</strong>
                    </span>
                );

                return;
            }

            throw error;
        }
    }

    render() {
        const t = this.props.t;

        let passwordResetLink;
        if (mailtrainConfig.isAuthMethodLocal) {
            passwordResetLink = <Link to={`/account/forgot/${this.getFormValue('username')}`}>{t('forgotYourPassword?')}</Link>;
        } else if (mailtrainConfig.externalPasswordResetLink) {
            passwordResetLink = <a href={mailtrainConfig.externalPasswordResetLink}>{t('forgotYourPassword?')}</a>;
        }

        return (
            <div>
                <Title>{t('signIn')}</Title>

                <Form stateOwner={this} onSubmitAsync={::this.submitHandler}>
                    <InputField id="username" label={t('username')}/>
                    <InputField id="password" label={t('password')} type="password" />
                    <CheckBox id="remember" text={t('rememberMe')}/>

                    <ButtonRow>
                        <Button type="submit" className="btn-primary" icon="ok" label={t('signIn')}/>
                        {passwordResetLink}
                    </ButtonRow>
                </Form>
            </div>
        );
    }
}