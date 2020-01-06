class ByWorldController < ApplicationController
  private

  def permit_modify
    not_found unless world.can_manage?(session[:user_id])
  end

  def permit_read
    not_found unless world.can_read?(session[:user_id])
  end

  def permit_write
    not_found unless world.can_write?(session[:user_id])
  end

  def world
    @world ||= World.find_by(slug: params[:world_slug])
  end
end
