# frozen_string_literal: true

module LocationsHelper
  def location_show_props_json
    {
      location: @location.to_full_h,
      permissions: world_permissions_props,
      timeline_units: @world.timeline_units,
      user_id: session[:user_id]
    }.merge(world_location_paths).to_camelback_keys.to_json
  end

  private

  def world_location_paths
    {
      characters_path: world_characters_path(@world.slug),
      events_path: world_events_path(@world.slug),
      locations_path: world_locations_path(@world.slug),
      relationships_path: world_relationships_path(@world.slug),
      tags_path: world_tags_path(@world.slug)
    }
  end
end
