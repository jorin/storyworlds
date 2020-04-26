# frozen_string_literal: true

class TagsController < ByWorldController
  before_action :permit_read, only: %i[index]

  def index
    render json: { tags: matched_tags }
  end

  private

  def matched_tags
    return world.tags if search.blank?

    world.tags.where('name like ?', "%#{search}%")
         .or(world.tags.where('slug like ?', "%#{search}%"))
  end

  def search
    params[:search]
  end
end
