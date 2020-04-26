# frozen_string_literal: true

module LocationsHelper
  def location_show_props_json
    {
      characters_path: world_characters_path(@world.slug),
      events_path: world_events_path(@world.slug),
      location: @location.to_full_h,
      locations_path: world_locations_path(@world.slug),
      permissions: world_permissions_props,
      tags_path: world_tags_path(@world.slug),
      timeline_units: @world.timeline_units,
      user_id: session[:user_id]
    }.to_camelback_keys.to_json
  end
end
