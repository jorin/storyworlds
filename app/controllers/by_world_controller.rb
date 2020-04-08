# frozen_string_literal: true

class ByWorldController < ApplicationController
  private

  def sort
    sort_by = params[:sort_by]&.to_sym
    if params[:sort_order] == 'desc'
      { sort_by => :desc, starts: :desc, ends: :desc }
    else
      [sort_by, :starts, :ends]
    end
  end

  def page(collection)
    return collection if params[:per_page].blank?

    collection.offset(params[:from] || 0).limit(params[:per_page])
  end

  def permit_modify
    not_found unless world.can_manage?(session[:user_id])
  end

  def permit_read
    return if world&.can_read?(session[:user_id])

    not_found if current_user.present?

    render 'worlds/index'
  end

  def permit_write
    not_found unless world.can_write?(session[:user_id])
  end

  def world
    @world ||= World.find_by(slug: params[:world_slug])
  end
end
