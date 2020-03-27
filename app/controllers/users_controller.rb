# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :require_user
  before_action :permit_update, only: %i[update]

  def update
    user = User.find(params[:id])
    if user.update(user_params)
      head :ok
    else
      render json: { error: user.errors.full_messages.join('; ') },
             status: :bad_request
    end
  end

  private

  def permit_update
    return if current_user.id == params[:id].to_i

    raise ActionController::BadRequest, 'Bad request'
  end

  def require_user
    not_found if current_user.blank?
  end

  def user_params
    params.permit(:first_name, :last_name, :password)
  end
end
