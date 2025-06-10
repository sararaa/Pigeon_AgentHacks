// Save this file in ./platform/authenticator/auth.go
//this is the reusable authentication module; essentially a bridge between out platform and auth0
/*
-> main.go
auth, err := authenticator.New()

-> login handler
token, err := auth.Exchange(ctx, code)

-> API
user, err := auth.VerifyIDToken(ctx, token)
*/

package authenticator

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

// Authenticator is used to authenticate our users.
type Authenticator struct {
	*oidc.Provider
	oauth2.Config
}

// New instantiates the *Authenticator.
func New() (*Authenticator, error) {

	domain := os.Getenv("AUTH0_DOMAIN") //general pattern: reads env variable ->
	if domain == "" {                   //checks if empty ->
		return nil, errors.New("AUTH0_DOMAIN environment variable is required") //return error if missing
	}

	clientID := os.Getenv("AUTH0_CLIENT_ID")
	//our platforms ID
	//okay to expose; it's our public identifier in Auth0
	if clientID == "" {
		return nil, errors.New("AUTH0_CLIENT_ID environment variable is required")
	}

	clientSecret := os.Getenv("AUTH0_CLIENT_SECRET")
	//MAKE SURE THIS IS NOT EXPOSED AT ALL even IN ENV FILE!!!
	//this proves legitimacy of backend to Auth0
	if clientSecret == "" {
		return nil, errors.New("AUTH0_CLIENT_SECRET environment variable is required")
	}

	callbackURL := os.Getenv("AUTH0_CALLBACK_URL")
	//where Auth0 sends users after they log in
	if callbackURL == "" {
		return nil, errors.New("AUTH0_CALLBACK_URL environment variable is required")
	}

	provider, err := oidc.NewProvider(
		context.Background(),
		"https://"+os.Getenv("AUTH0_DOMAIN")+"/",
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create OIDC provider: %w", err) //fixed: provides better error messaging
	}

	conf := oauth2.Config{
		ClientID:     os.Getenv("AUTH0_CLIENT_ID"),
		ClientSecret: os.Getenv("AUTH0_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("AUTH0_CALLBACK_URL"),
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile"},
	}

	return &Authenticator{
		Provider: provider,
		Config:   conf,
	}, nil
}

// VerifyIDToken verifies that an *oauth2.Token is a valid *oidc.IDToken.
func (a *Authenticator) VerifyIDToken(ctx context.Context, token *oauth2.Token) (*oidc.IDToken, error) {
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return nil, errors.New("no id_token field in oauth2 token")
	}

	oidcConfig := &oidc.Config{
		ClientID: a.Config.ClientID, // fixed: use a.Config.ClientID instead of a.ClientID bc client ID exists within config struct
	}

	return a.Provider.Verifier(oidcConfig).Verify(ctx, rawIDToken)
	//a.Provider.Verifier(oidcConfig) -> creates a token verifier
	//.Verify(ctx,rawIDToken) -> user verifier ^ to check the token
}
