class SessionsController < ApplicationController
  def create
    user = User.find_by(email: params[:email])
    session[:user_id] = user.id if user && user.authenticate(params[:password])
    redirect_to request.referer
  end

  def destroy
    session[:user_id] = nil
    
    redirect_to root_url
  end
end
