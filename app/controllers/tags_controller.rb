# frozen_string_literal: true

class TagsController < ByWorldController
  before_action :permit_read, only: %i[index]

  def index
    render json: { tags: matched_tags }
  end

  private

  def matched_tags
    searched_tags(world.tags).where(params.permit(id: []))
  end

  def search
    params[:search]
  end

  def searched_tags(tags)
    return tags if search.blank?

    tags.where('name like ?', "%#{search}%")
        .or(tags.where('slug like ?', "%#{search}%"))
  end
end
