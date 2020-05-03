# frozen_string_literal: true

class LocationsController < ByWorldController
  before_action :location, only: %i[show]
  before_action :permit_location_update, only: %i[update]
  before_action :permit_read, only: %i[index show]
  before_action :permit_write, only: %i[create]

  def index
    render json: { locations: page(locations).map(&:to_full_h),
                   total: locations.size }.to_camelback_keys
  end

  def create
    @location = world.locations
                     .create(location_params.merge(creator: current_user))
    render_for_location(location.persisted?)
  end

  def update
    render_for_location(location.update(location_params))
  end

  private

  def filtered_locations
    locations = world.locations.includes(:taggings, :tags).order(sort)
    if params[:search].present?
      locations = locations
                  .where('name like ?', "%#{params[:search]}%")
    end
    locations
  end

  def location
    @location ||= world&.locations&.find_by(id: params[:id])
  end

  def location_params
    location_params = params.require(:location)
                            .permit(:id, :description, :ends, :name,
                                    :parent_id, :starts,
                                    taggings: [:id, :_destroy,
                                               tag: %i[id name slug]])
    format_tag_params!(location_params)
  end

  def locations
    @locations ||= filter(filtered_locations)
  end

  def permit_location_update
    unless world.can_manage?(session[:user_id]) ||
           (world.can_write?(session[:user_id]) &&
            location.creator_id == session[:user_id])
      not_found
    end
  end

  def render_for_location(success)
    if success
      render json: location.to_full_h.to_camelback_keys
    else
      render json: { error: location.errors.full_messages.join('; ') },
             status: :bad_request
    end
  end
end
