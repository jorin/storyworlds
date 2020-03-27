# frozen_string_literal: true

class ApplicationController < ActionController::Base
  helper_method :current_user

  def current_user
    return if session[:user_id].blank?

    @current_user ||= User.find(session[:user_id])
  end

  def not_found
    raise ActionController::RoutingError, 'Not Found'
  end
end
