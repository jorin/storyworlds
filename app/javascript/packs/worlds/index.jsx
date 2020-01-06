import RenderService from 'services/render_service';
import Dashboard from 'components/worlds/dashboard';

document.addEventListener('DOMContentLoaded', () => {
  RenderService.render('worlds', Dashboard);
});
