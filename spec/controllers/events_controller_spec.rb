# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventsController, type: :controller do
  describe 'GET #index' do
    it_behaves_like 'read world items'

    # TODO: test for events filtered to character
    # TODO: test for events filtered to location
  end
end
