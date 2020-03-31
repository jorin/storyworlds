# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LocationsController, type: :controller do
  describe 'GET #index' do
    it_behaves_like 'read world items'
    it_behaves_like 'name-searchable world items'
  end

  describe 'POST #create' do
    it_behaves_like 'create world item'
  end

  describe 'PATCH #update' do
    it_behaves_like 'update world item'
  end
end
