module LocationsHelper
  def location_show_props_json
    {
      characters_path: world_characters_path(@world.slug),
      events_path: world_events_path(@world.slug),
      location: @location.attributes,
      locations_path: world_locations_path(@world.slug),
      permissions: world_permissions_props,
      timeline_units: @world.timeline_units,
      user_id: session[:user_id],
    }.to_camelback_keys.to_json
  end
end
