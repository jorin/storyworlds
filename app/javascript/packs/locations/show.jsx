import RenderService from 'services/render_service';
import Detail from 'components/locations/detail';

document.addEventListener('DOMContentLoaded', () => {
  RenderService.render('location', Detail);
});
