# frozen_string_literal: true

Rails.application.routes.draw do
  root 'worlds#index'

  resources :sessions, only: %i[create] do
    collection do
      delete :index, action: :destroy
    end
  end

  resources :users

  resources :worlds, param: :slug do
    resources :characters
    resources :events
    resources :locations
    resources :tags, only: %i[index]
    resources :world_permissions, only: %i[create destroy update]
  end
end
