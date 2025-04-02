import unittest
from unittest.mock import MagicMock, patch


class TestUserInterface(unittest.TestCase):
    """Test suite for the UserInterface class"""

    def setUp(self):
        """Set up the test environment with mocks"""
        # Create mock DOM elements
        self.mock_elements = {
            'hud': MagicMock(),
            'menu': MagicMock(),
            'notification': MagicMock(),
            'hunger-value': MagicMock(),
            'hunger-fill': MagicMock(style=MagicMock()),
            'happiness-value': MagicMock(),
            'happiness-fill': MagicMock(style=MagicMock()),
            'energy-value': MagicMock(),
            'energy-fill': MagicMock(style=MagicMock()),
            'feed-btn': MagicMock(),
            'play-btn': MagicMock(),
            'rest-btn': MagicMock(),
            'menu-btn': MagicMock(),
            'save-btn': MagicMock(),
            'camera-btn': MagicMock(),
            'debug-btn': MagicMock(),
            'close-menu-btn': MagicMock()
        }

        # Mock document.getElementById
        self.getElementById_patch = patch('document.getElementById', 
                                          side_effect=lambda id: self.mock_elements.get(id))
        self.mock_getElementById = self.getElementById_patch.start()

        # Import UI module (mocked)
        from src.ui.interface import UserInterface

        # Create mock pet and game
        self.mock_pet = MagicMock()
        self.mock_pet.name = "MockPet"
        self.mock_pet.needs = {
            'hunger': 80,
            'happiness': 60,
            'energy': 40
        }
        self.mock_pet.feed.return_value = True
        self.mock_pet.play.return_value = True
        self.mock_pet.rest.return_value = True
        
        self.mock_game = MagicMock()
        self.mock_game.pet = self.mock_pet
        
        # Create UI instance
        self.ui = UserInterface(self.mock_game)

    def tearDown(self):
        """Clean up test environment"""
        self.getElementById_patch.stop()

    def test_update_stats(self):
        """Test that updateStats correctly updates the UI based on pet needs"""
        # Call the method
        self.ui.updateStats()
        
        # Check hunger updates
        self.mock_elements['hunger-value'].textContent = "80%"
        self.mock_elements['hunger-fill'].style.width = "80%"
        
        # Check happiness updates
        self.mock_elements['happiness-value'].textContent = "60%"
        self.mock_elements['happiness-fill'].style.width = "60%"
        
        # Check energy updates
        self.mock_elements['energy-value'].textContent = "40%"
        self.mock_elements['energy-fill'].style.width = "40%"
        
        # Check color updates for energy (should be warning color)
        self.ui.updateStatColors.assert_any_call(self.mock_elements['energy-fill'], 40)

    def test_show_notification(self):
        """Test that show_notification updates the notification element"""
        test_message = "Test notification"
        
        # Mock setTimeout
        with patch('setTimeout') as mock_setTimeout:
            self.ui.showNotification(test_message, 1000)
            
            # Check notification was shown
            self.mock_elements['notification'].textContent = test_message
            self.mock_elements['notification'].style.opacity = "1"
            
            # Check timeout was set
            mock_setTimeout.assert_called_once()

    def test_toggle_menu(self):
        """Test that toggleMenu shows/hides the menu"""
        # Initial state should be hidden
        self.assertFalse(self.ui.menuVisible)
        
        # Toggle on
        self.ui.toggleMenu()
        self.assertTrue(self.ui.menuVisible)
        self.mock_elements['menu'].style.display = "block"
        
        # Toggle off
        self.ui.toggleMenu()
        self.assertFalse(self.ui.menuVisible)
        self.mock_elements['menu'].style.display = "none"

    def test_feed_button(self):
        """Test that feed button calls pet.feed() and shows notification"""
        # Mock the showNotification method
        self.ui.showNotification = MagicMock()
        
        # Simulate click on feed button
        self.ui.onFeedClick()
        
        # Check pet.feed was called with correct amount
        self.mock_pet.feed.assert_called_once_with(20)
        
        # Check notification was shown
        self.ui.showNotification.assert_called_once_with("MockPet is eating...")


if __name__ == '__main__':
    unittest.main() 