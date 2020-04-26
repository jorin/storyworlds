# frozen_string_literal: true

module WorldsHelper
  def world_show_props_json
    {
      characters_props: characters_props,
      contributors_props: contributors_props,
      events_props: events_props,
      locations_props: locations_props,
      permissions: world_permissions_props,
      tags_path: world_tags_path(@world.slug),
      user_id: session[:user_id],
      world_path: world_path(@world.slug),
      world: @world.attributes
    }.to_camelback_keys.to_json
  end

  def worlds_index_props_json
    (current_user.present? ? index_user_props : index_anon_props)
      .merge(list_props: list_props)
      .to_camelback_keys.to_json
  end

  def world_permissions_props
    {
      manage: @world.can_manage?(session[:user_id]),
      read: @world.can_read?(session[:user_id]),
      write: @world.can_write?(session[:user_id])
    }
  end

  private

  def characters_props
    {
      item_key: 'character',
      item_label: 'Character',
      items_key: 'characters',
      items_path: world_characters_path(@world.slug)
    }
  end

  def contributors_props
    return unless @world.can_manage?(session[:user_id])

    {
      contributors: @world.world_permissions
                          .includes(:user)
                          .map(&:to_contributor_h),
      permissions_path: world_world_permissions_path(@world.slug)
    }
  end

  def events_props
    {
      characters_path: world_characters_path(@world.slug),
      events_path: world_events_path(@world.slug),
      locations_path: world_locations_path(@world.slug),
      timeline_units: @world.timeline_units
    }
  end

  def index_anon_props
    {}
  end

  def index_user_props
    {
      create_props: path_props,
      user_id: session[:user_id]
    }
  end

  def list_props
    {
      created_ids: current_user&.created_worlds&.pluck(:id),
      permissions: current_user&.world_permissions
                               &.each_with_object({}) do |p, ids|
                     ids[p.world_id] = p.permission
                   end
    }.merge(path_props)
  end

  def locations_props
    {
      item_key: 'location',
      item_label: 'Location',
      items_key: 'locations',
      items_path: world_locations_path(@world.slug)
    }
  end

  def path_props
    {
      world_path: world_path(':slug'),
      worlds_path: worlds_path
    }
  end
end
