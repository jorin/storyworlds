# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CharactersController, type: :controller do
  describe 'GET #index' do
    it_behaves_like 'read world items'

    # TODO: test for characters in a starts ends params timeline
    # TODO: test for locations filtered to search param
  end
end
