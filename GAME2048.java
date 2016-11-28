import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import javax.swing.JOptionPane;
import java.util.Random;

public class GAME2048 extends KeyAdapter
{
   int size = 4;
   int board[][] = new int[size][size];
   JLabel textboard[][] = new JLabel[size][size];
   
   public GAME2048()
   {
      //basic setting
      JPanel panel = new JPanel();
      JFrame frame = new JFrame();
      
      frame.setTitle("2048");
      frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
      frame.setSize(600, 600);
      frame.addKeyListener(this);
      
      panel.setLayout(new GridLayout(size, size));
      frame.add(panel);
      
      create();
      RandomAppear();
      update();
      //put all label into the panel
      for (int i = 0; i < textboard.length; i++)
      {
         for (int j = 0; j < textboard[i].length; j++)
         {
            panel.add(textboard[i][j]);
         }
      }
      
      frame.setVisible(true);
   }
   
   public void RandomAppear()
   {
      Random rnd = new Random();
      int ranx = rnd.nextInt(4);
      int rany = rnd.nextInt(4);
      while (board[ranx][rany] != 0)
      {
         ranx = rnd.nextInt(4);
         rany = rnd.nextInt(4);
      }
      // num = rnd.nextInt(2) + 1;
      board[ranx][rany] = 2;
      printBoard();
   }
   
      //coding for testing
   public void printBoard()
   {
      for (int i = 0; i < board.length; i++)
      {
         for (int j = 0; j < board[i].length; j++)
         {
            System.out.print(board[i][j]);
         }
         System.out.println();
      }   
   }
   
   public void keyPressed(KeyEvent e)
   {
      int keyCode = e.getKeyCode();
      int m = 0;
      switch(keyCode)
      {
         case KeyEvent.VK_UP:
            UpKeyPressed();
            break;
         case KeyEvent.VK_DOWN:
            DownKeyPressed();
            break;
         case KeyEvent.VK_LEFT:
            LeftKeyPressed();
            break;
         case KeyEvent.VK_RIGHT:
            RightKeyPressed();
            break;
      }
      RandomAppear();
      update();
      if (!CheckGameOver())
      {
         JOptionPane.showMessageDialog(null, "There are no place to move anymore.");
      }
   } 
   
   public void UpKeyPressed()
   {
      for (int i = 0; i < board.length; i++)
      {
         for (int j = 1; j < board[i].length; j++)
         {
            if (board[j][i] != 0)
            {
               int m = j-1;
               int n = j;
               int check = 0;
               while (m >= check)
               {
                  if (board[n][i] == board[m][i])
                  {
                     board[m][i] += board[n][i];
                     board[n][i] = 0;
                     check += 2;
                  }
                  else if (board[m][i] == 0)
                  {
                     board[m][i] = board[n][i];
                     board[n][i] = 0;
                  }
                  m--;
                  n--;
                  
               }
            }
         }
      }
   }
   
   public void DownKeyPressed()
   {
      for (int i = 0; i < board.length; i++)
      {
         for (int j = board[i].length - 1; j >= 0; j--)
         {
            if (board[j][i] != 0)
            {
               int m = j+1;
               int n = j;
               int check = board[i].length;
               while (m < check)
               {
                  if (board[n][i] == board[m][i])
                  {
                     board[m][i] += board[n][i];
                     board[n][i] = 0;
                     check -= 2;
                  }
                  else if (board[m][i] == 0)
                  {
                     board[m][i] = board[n][i];
                     board[n][i] = 0;
                  }
                  m++;
                  n++;
               }
            }
         }
      }
   }
   
   public void LeftKeyPressed()
   {
      for (int i = 0; i < board.length; i++)
      {
         for (int j = 1; j < board[i].length; j++)
         {
            if (board[i][j] != 0)
            {
               int m = j-1;
               int n = j;
               int check = 0;
               while (m >= check)
               {
                  if (board[i][n] == board[i][m])
                  {
                     board[i][m] += board[i][n];
                     board[i][n] = 0;
                     check += 2;
                  }
                  else if (board[i][m] == 0)
                  {
                     board[i][m] = board[i][n];
                     board[i][n] = 0;
                  }
                  m--;
                  n--;
               }
            }
         }
      }
   }
   
   public void RightKeyPressed()
   {
      for (int i = 0; i < board.length; i++)
      {
         for (int j = board[i].length - 1; j >= 0; j--)
         {
            if (board[i][j] != 0)
            {
               int m = j+1;
               int n = j;
               int check = board[i].length;
               while (m < check)
               {
                  if (board[i][n] == board[i][m])
                  {
                     board[i][m] += board[i][n];
                     board[i][n] = 0;
                     check -= 2;
                  }
                  else if (board[i][m] == 0)
                  {
                     board[i][m] = board[i][n];
                     board[i][n] = 0;
                  }
                  m++;
                  n++;
               }
            }
         }
      }
   }
   
   //check if the game over
   public boolean CheckGameOver()
   {
      boolean NotYet = false;
      //check if there are zero
      for (int i = 0; i < board.length; i++)
      {
         for (int j = 0; j < board[i].length; j++)
         {
            if (board[i][j] == 0)
            {
               NotYet = true;
            }
         }
      }
      if (!NotYet)
      {
      //check for horizontal 
         for (int i = 0; i < board.length; i++)
         {
            for (int j = 0; j < board[i].length-1; j++)
            {
               if (board[i][j] == board[i][j+1])
               {
                  NotYet = true;
               }
            }
         }
      //check for vertical
         for (int i = 0; i < board.length; i++)
         {
            for (int j = 0; j < board[i].length-1; j++)
            {
               if (board[j][i] == board[j+1][i])
               {
                  NotYet = true;
               }
            }
         }
      }
      
      return NotYet;      
   }
   
   //creating and updating board
   public void create()
   {
      for (int i = 0; i < textboard.length; i++)
      {
         for (int j = 0; j < textboard[i].length; j++)
         {
            textboard[i][j] = new JLabel();
            textboard[i][j].setText(Integer.toString(board[i][j]));
            textboard[i][j].setHorizontalAlignment(SwingConstants.CENTER);
            textboard[i][j].setFont(textboard[i][j].getFont().deriveFont(64f));
            textboard[i][j].setBorder(BorderFactory.createLineBorder(Color.BLUE, 3));
         }
      }
   }  
   
   public void update()
   {
      for (int i = 0; i < textboard.length; i++)
      {
         for (int j = 0; j <textboard[i].length; j++)
         {
            textboard[i][j].setText(Integer.toString(board[i][j]));
            if (board[i][j] == 0)
            {
               textboard[i][j].setText(" ");
            }
         }
      }
   }   
   public static void main(String[] args)
   {
      new GAME2048();
   }
}

