# frozen_string_literal: true

class EventsController < ByWorldController
  before_action :permit_event_update, only: %i[update]
  before_action :permit_read, only: %i[index]
  before_action :permit_write, only: %i[create]

  def index
    # TODO: search
    render json: { events: page_of_events.map(&:to_full_event_h),
                   total: events.size }.to_camelback_keys
  end

  def create
    create_event
    render_for_event(event.persisted?)
  end

  def update
    render_for_event(event.update(event_params))
  end

  private

  def create_event
    ActiveRecord::Base.transaction do
      @event = world.events.create(event_params.merge(creator: current_user))
      raise ActiveRecord::Rollback unless @event.persisted?
    end
  end

  def event
    @event ||= world.events.find(params[:id])
  end

  def events
    @events ||=
      events_for_character(world.events
                                .includes(:characters, :location, :participants)
                                .where(params.permit(:location_id)),
                           params[:character_id])
      .order(params[:sort]&.to_sym, :starts, :ends)
  end

  def events_for_character(events, character_id)
    return events if character_id.blank?

    events.where(characters: { id: character_id })
  end

  def event_params
    event_params = params.require(:event)
                         .permit(:id, :description, :ends, :location_id,
                                 :name, :starts,
                                 participants: %i[id character_id _destroy])
                         .merge(event_location_params || {})
    if event_params[:participants].present?
      event_params[:participants_attributes] = event_params
                                               .delete(:participants)
    end
    event_params
  end

  def event_location_params
    return {} if params[:location].blank?

    { location_id: world.locations
                        .create!(params.require(:location)
                                        .permit(:ends, :name, :starts)
                                        .merge(creator: current_user)).id }
  end

  def page_of_events
    return events if params[:per_page].blank?

    events.offset(params[:from] || 0).limit(params[:per_page])
  end

  def permit_event_update
    unless world.can_manage?(session[:user_id]) ||
           (world.can_write?(session[:user_id]) &&
            event.creator_id == session[:user_id])
      not_found
    end
  end

  def render_for_event(success)
    if success
      render json: event.to_full_event_h.to_camelback_keys
    else
      render json: { error: event.errors.full_messages.join('; ') },
             status: :bad_request
    end
  end
end
