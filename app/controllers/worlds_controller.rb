class WorldsController < ApplicationController
  before_action :permit_create, only: %i[create]
  before_action :permit_show, only: %i[show]
  before_action :permit_update, only: %i[update]

  def index
    respond_to do |format|
      format.html
      format.json { render json: page }
    end
  end

  def create
    @world = World.create(world_params.merge(creator: current_user))
    render_for_world(world.persisted?)
  end

  def update
    render_for_world(world.update(world_params))
  end

  private

  def page
    worlds = World.where(open: true)
    if current_user.present?
      worlds = worlds.or(current_user.created_worlds)
                     .or(World.where(id: current_user.world_permissions.pluck(:world_id)))
    end

    # TODO: sorting, paginating, etc
    { worlds: worlds.map(&:attributes).to_camelback_keys }
  end

  def permit_create
    not_found if current_user.blank?
  end

  def permit_show
    not_found unless world.can_read?(session[:user_id])
  end

  def permit_update
    not_found unless world.can_manage?(session[:user_id])
  end

  def render_for_world(success)
    if success
      render json: world.attributes.to_camelback_keys
    else
      render json: { error: world.errors.full_messages.join('; ') },
             status: :bad_request
    end
  end

  def world
    @world ||= World.find_by(slug: params[:slug])
  end

  def world_params
    params.require(:world)
          .permit(:id, :description, :name, :open, :slug, :timeline_units)
  end
end
